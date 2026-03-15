const Station = require('../models/Station');
const Charger = require('../models/Charger');
const ChargingSession = require('../models/ChargingSession');

/**
 * GET /api/partner/stations - list stations owned by current partner
 */
exports.getMyStations = async (req, res) => {
  try {
    const stations = await Station.find({ ownerId: req.user._id })
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
 * POST /api/partner/stations - create a new station (and default chargers)
 */
exports.createStation = async (req, res) => {
  try {
    const { name, address, latitude, longitude, pricePerKwh, totalChargers } = req.body;
    if (!name || !address || latitude == null || longitude == null || pricePerKwh == null || !totalChargers) {
      return res.status(400).json({ message: 'Name, address, latitude, longitude, pricePerKwh, totalChargers required' });
    }
    const station = await Station.create({
      ownerId: req.user._id,
      name,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      pricePerKwh: Number(pricePerKwh),
      totalChargers: Math.max(1, parseInt(totalChargers, 10) || 1),
    });
    // Create default chargers
    const count = station.totalChargers;
    for (let i = 0; i < count; i++) {
      await Charger.create({
        stationId: station._id,
        chargerType: 'Type 2',
        powerKw: 22,
        status: 'available',
      });
    }
    const chargers = await Charger.find({ stationId: station._id }).lean();
    res.status(201).json({ ...station.toObject(), chargers, availableChargers: count, totalChargers: count });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create station' });
  }
};

/**
 * PUT /api/partner/stations/:id - update own station
 */
exports.updateStation = async (req, res) => {
  try {
    const station = await Station.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!station) return res.status(404).json({ message: 'Station not found' });
    const { name, address, latitude, longitude, pricePerKwh } = req.body;
    if (name != null) station.name = name;
    if (address != null) station.address = address;
    if (latitude != null) station.latitude = Number(latitude);
    if (longitude != null) station.longitude = Number(longitude);
    if (pricePerKwh != null) station.pricePerKwh = Number(pricePerKwh);
    await station.save();
    res.json(station);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update station' });
  }
};

/**
 * GET /api/partner/sessions - charging sessions at partner's stations
 */
exports.getMySessions = async (req, res) => {
  try {
    const myStations = await Station.find({ ownerId: req.user._id }).distinct('_id');
    const sessions = await ChargingSession.find({ stationId: { $in: myStations }, status: 'completed' })
      .sort({ endTime: -1 })
      .populate('stationId', 'name address')
      .lean();
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch sessions' });
  }
};

/**
 * GET /api/partner/dashboard - summary stats for partner
 */
exports.getDashboard = async (req, res) => {
  try {
    const myStations = await Station.find({ ownerId: req.user._id }).distinct('_id');
    const [stationCount, sessions, totalRevenue] = await Promise.all([
      Station.countDocuments({ ownerId: req.user._id }),
      ChargingSession.find({ stationId: { $in: myStations }, status: 'completed' }).lean(),
      ChargingSession.aggregate([
        { $match: { stationId: { $in: myStations }, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$cost' } } },
      ]),
    ]);
    const revenue = totalRevenue[0]?.total ?? 0;
    res.json({
      stationCount,
      sessionCount: sessions.length,
      totalRevenue: Math.round(revenue * 100) / 100,
      recentSessions: sessions.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch dashboard' });
  }
};
