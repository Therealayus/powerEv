const Charger = require('../models/Charger');

/**
 * GET /api/stations/:id/chargers - list chargers for a station
 */
exports.getChargersByStation = async (req, res) => {
  try {
    const chargers = await Charger.find({ stationId: req.params.id }).lean();
    res.json(chargers);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch chargers' });
  }
};
