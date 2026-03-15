const User = require('../models/User');
const Station = require('../models/Station');
const Charger = require('../models/Charger');
const ChargingSession = require('../models/ChargingSession');
const Setting = require('../models/Setting');

const userListFields = 'name email role emailVerified createdAt';

/**
 * GET /api/admin/users - list all users (drivers; exclude password)
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' })
      .select(userListFields)
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch users' });
  }
};

/**
 * GET /api/admin/partners - list all partners
 */
exports.getPartners = async (req, res) => {
  try {
    const partners = await User.find({ role: 'partner' })
      .select(userListFields)
      .sort({ createdAt: -1 })
      .lean();
    res.json(partners);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch partners' });
  }
};

/**
 * GET /api/admin/stations - list all stations; optional ?partnerId= to filter by partner
 */
exports.getStations = async (req, res) => {
  try {
    const filter = req.query.partnerId ? { ownerId: req.query.partnerId } : {};
    const stations = await Station.find(filter)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    const withChargers = await Promise.all(
      stations.map(async (s) => {
        const chargers = await Charger.find({ stationId: s._id }).lean();
        const available = chargers.filter((c) => c.status === 'available').length;
        return { ...s, chargers, availableChargers: available, totalChargers: chargers.length };
      })
    );
    res.json(withChargers);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch stations' });
  }
};

/**
 * GET /api/admin/sessions - list all charging sessions (completed); optional ?partnerId= to filter by partner
 */
exports.getSessions = async (req, res) => {
  try {
    const match = { status: 'completed' };
    if (req.query.partnerId) {
      const stationIds = await Station.find({ ownerId: req.query.partnerId }).distinct('_id');
      match.stationId = { $in: stationIds };
    }
    const sessions = await ChargingSession.find(match)
      .sort({ endTime: -1 })
      .populate('userId', 'name email')
      .populate('stationId', 'name address')
      .lean();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch sessions' });
  }
};

/**
 * GET /api/admin/dashboard - platform-wide stats; optional ?partnerId= to filter by partner
 */
exports.getDashboard = async (req, res) => {
  try {
    const partnerId = req.query.partnerId;
    let stationFilter = {};
    let sessionMatch = { status: 'completed' };
    if (partnerId) {
      const stationIds = await Station.find({ ownerId: partnerId }).distinct('_id');
      stationFilter = { _id: { $in: stationIds } };
      sessionMatch.stationId = { $in: stationIds };
    }
    const [
      userCount,
      partnerCount,
      stationCount,
      sessionCount,
      sessions,
      totalRevenue,
    ] = await Promise.all([
      partnerId ? Promise.resolve(0) : User.countDocuments({ role: 'user' }),
      partnerId ? Promise.resolve(1) : User.countDocuments({ role: 'partner' }),
      Station.countDocuments(partnerId ? { ownerId: partnerId } : {}),
      ChargingSession.countDocuments(sessionMatch),
      ChargingSession.find(sessionMatch).sort({ endTime: -1 }).limit(10).populate('userId', 'name email').populate('stationId', 'name').lean(),
      ChargingSession.aggregate([
        { $match: sessionMatch },
        { $group: { _id: null, total: { $sum: '$cost' } } },
      ]),
    ]);
    const revenue = totalRevenue[0]?.total ?? 0;
    res.json({
      userCount: partnerId ? undefined : userCount,
      partnerCount: partnerId ? undefined : partnerCount,
      stationCount,
      sessionCount,
      totalRevenue: Math.round(revenue * 100) / 100,
      recentSessions: sessions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch dashboard' });
  }
};

const TERMS_KEY = 'termsAndConditions';

/**
 * PUT /api/admin/terms - update Terms and Conditions (admin only). Body: { content: string }
 */
exports.updateTerms = async (req, res) => {
  try {
    const { content } = req.body;
    if (typeof content !== 'string') {
      return res.status(400).json({ message: 'content (string) is required' });
    }
    const doc = await Setting.findOneAndUpdate(
      { key: TERMS_KEY },
      { $set: { value: content.trim() } },
      { new: true, upsert: true }
    );
    res.json({ content: doc.value });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update terms' });
  }
};
