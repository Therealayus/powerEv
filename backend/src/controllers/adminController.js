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
 * GET /api/admin/partners/:id - partner detail: stats + users (drivers) who charged at their stations with history/revenue
 */
exports.getPartnerById = async (req, res) => {
  try {
    const partner = await User.findOne({ _id: req.params.id, role: 'partner' })
      .select(userListFields)
      .lean();
    if (!partner) return res.status(404).json({ message: 'Partner not found' });
    const stationIds = await Station.find({ ownerId: partner._id }).distinct('_id');
    const [stationCount, revenueAgg, sessionsByUser] = await Promise.all([
      Station.countDocuments({ ownerId: partner._id }),
      ChargingSession.aggregate([
        { $match: { status: 'completed', stationId: { $in: stationIds } } },
        { $group: { _id: null, total: { $sum: '$cost' } } },
      ]),
      ChargingSession.aggregate([
        { $match: { status: 'completed', stationId: { $in: stationIds } } },
        { $group: { _id: '$userId', sessionCount: { $sum: 1 }, revenue: { $sum: '$cost' } } },
        { $sort: { revenue: -1 } },
      ]),
    ]);
    const userIds = sessionsByUser.map((s) => s._id).filter(Boolean);
    const users = await User.find({ _id: { $in: userIds }, role: 'user' })
      .select('name email')
      .lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));
    const usersWithStats = sessionsByUser.map((s) => ({
      userId: s._id,
      name: userMap[s._id?.toString()]?.name ?? '—',
      email: userMap[s._id?.toString()]?.email ?? '—',
      sessionCount: s.sessionCount,
      revenue: Math.round(s.revenue * 100) / 100,
    }));
    const totalRevenue = Math.round((revenueAgg[0]?.total ?? 0) * 100) / 100;
    const totalSessionCount = await ChargingSession.countDocuments({ status: 'completed', stationId: { $in: stationIds } });
    res.json({
      ...partner,
      stationCount,
      sessionCount: totalSessionCount,
      totalRevenue,
      users: usersWithStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch partner' });
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
 * POST /api/admin/stations - create station (admin chooses ownerId = partner)
 * Body: name, address, latitude, longitude, pricePerKwh, totalChargers, ownerId (required)
 */
exports.createStation = async (req, res) => {
  try {
    const { name, address, latitude, longitude, pricePerKwh, totalChargers, ownerId } = req.body;
    if (!name || !address || latitude == null || longitude == null || pricePerKwh == null || !totalChargers || !ownerId) {
      return res.status(400).json({ message: 'Name, address, latitude, longitude, pricePerKwh, totalChargers and ownerId (partner) required' });
    }
    const partner = await User.findOne({ _id: ownerId, role: 'partner' });
    if (!partner) return res.status(400).json({ message: 'ownerId must be a valid partner' });
    const station = await Station.create({
      ownerId,
      name,
      address,
      latitude: Number(latitude),
      longitude: Number(longitude),
      pricePerKwh: Number(pricePerKwh),
      totalChargers: Math.max(1, parseInt(totalChargers, 10) || 1),
    });
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
    const populated = await Station.findById(station._id).populate('ownerId', 'name email').lean();
    res.status(201).json({ ...populated, chargers, availableChargers: count, totalChargers: count });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to create station' });
  }
};

/**
 * PUT /api/admin/stations/:id - update any station (admin); can reassign ownerId to another partner
 */
exports.updateStation = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id);
    if (!station) return res.status(404).json({ message: 'Station not found' });
    const { name, address, latitude, longitude, pricePerKwh, ownerId } = req.body;
    if (name != null) station.name = name;
    if (address != null) station.address = address;
    if (latitude != null) station.latitude = Number(latitude);
    if (longitude != null) station.longitude = Number(longitude);
    if (pricePerKwh != null) station.pricePerKwh = Number(pricePerKwh);
    if (ownerId != null) {
      const partner = await User.findOne({ _id: ownerId, role: 'partner' });
      if (!partner) return res.status(400).json({ message: 'ownerId must be a valid partner' });
      station.ownerId = ownerId;
    }
    await station.save();
    const populated = await Station.findById(station._id).populate('ownerId', 'name email').lean();
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update station' });
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
