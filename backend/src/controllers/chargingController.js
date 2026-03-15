const ChargingSession = require('../models/ChargingSession');
const Charger = require('../models/Charger');
const Station = require('../models/Station');
const User = require('../models/User');
const { startSimulation, stopSimulation } = require('../services/chargingSimulation');
const { sendSessionComplete, sendPartnerSessionNotification } = require('../services/emailService');

/**
 * POST /api/charging/start - start a charging session
 * Body: { stationId, chargerId }
 */
exports.startCharging = async (req, res) => {
  try {
    const { stationId, chargerId } = req.body;
    const userId = req.user._id;
    if (!stationId || !chargerId) {
      return res.status(400).json({ message: 'stationId and chargerId required' });
    }
    const active = await ChargingSession.findOne({ userId, status: 'active' });
    if (active) {
      return res.status(400).json({ message: 'Already have an active session' });
    }
    const charger = await Charger.findOne({ _id: chargerId, stationId });
    if (!charger) return res.status(404).json({ message: 'Charger not found' });
    if (charger.status !== 'available') {
      return res.status(400).json({ message: 'Charger is not available' });
    }
    const station = await Station.findById(stationId).lean();
    if (!station) return res.status(404).json({ message: 'Station not found' });

    charger.status = 'charging';
    await charger.save();

    const session = await ChargingSession.create({
      userId,
      stationId,
      chargerId,
      status: 'active',
    });

    startSimulation(session._id, charger.powerKw, station.pricePerKwh);

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to start charging' });
  }
};

/**
 * POST /api/charging/stop - stop active session
 */
exports.stopCharging = async (req, res) => {
  try {
    const userId = req.user._id;
    const session = await ChargingSession.findOne({ userId, status: 'active' })
      .populate('chargerId')
      .populate('stationId');
    if (!session) {
      return res.status(404).json({ message: 'No active charging session' });
    }
    stopSimulation(session._id);
    session.endTime = new Date();
    session.status = 'completed';
    await session.save();

    await Charger.findByIdAndUpdate(session.chargerId._id, { status: 'available' });

    // Email user (driver) session receipt; email station owner if station has ownerId
    const stationName = session.stationId?.name || 'Station';
    const unitsConsumed = (session.unitsConsumed ?? 0).toFixed(2);
    const cost = (session.cost ?? 0).toFixed(2);
    const payload = { stationName, unitsConsumed, cost };
    const userDoc = await User.findById(session.userId).select('email').lean();
    if (userDoc?.email) {
      sendSessionComplete(userDoc.email, payload).catch((err) =>
        console.warn('Session complete email failed:', err.message)
      );
    }
    const station = await Station.findById(session.stationId._id).select('ownerId').populate('ownerId', 'email').lean();
    if (station?.ownerId?.email) {
      sendPartnerSessionNotification(station.ownerId.email, payload).catch((err) =>
        console.warn('Partner session notification failed:', err.message)
      );
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to stop charging' });
  }
};

/**
 * GET /api/charging/active - current user's active session (for live dashboard)
 */
exports.getActive = async (req, res) => {
  try {
    const session = await ChargingSession.findOne({ userId: req.user._id, status: 'active' })
      .populate('stationId', 'name address pricePerKwh')
      .populate('chargerId', 'powerKw chargerType')
      .lean();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch active session' });
  }
};

/**
 * GET /api/charging/history - user's charging history
 */
exports.getHistory = async (req, res) => {
  try {
    const sessions = await ChargingSession.find({ userId: req.user._id, status: 'completed' })
      .sort({ endTime: -1 })
      .populate('stationId', 'name address pricePerKwh')
      .lean();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch history' });
  }
};
