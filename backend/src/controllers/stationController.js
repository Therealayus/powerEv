const Station = require('../models/Station');
const Charger = require('../models/Charger');

/**
 * GET /api/stations - list all stations with charger availability
 */
exports.getStations = async (req, res) => {
  try {
    const stations = await Station.find().lean();
    const result = await Promise.all(
      stations.map(async (s) => {
        const chargers = await Charger.find({ stationId: s._id }).lean();
        const available = chargers.filter((c) => c.status === 'available').length;
        const total = chargers.length;
        let markerColor = 'red';
        if (available > 0) markerColor = available >= total / 2 ? 'green' : 'orange';
        return { ...s, availableChargers: available, totalChargers: total, markerColor };
      })
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch stations' });
  }
};

/**
 * GET /api/stations/:id - single station with chargers
 */
exports.getStationById = async (req, res) => {
  try {
    const station = await Station.findById(req.params.id).lean();
    if (!station) return res.status(404).json({ message: 'Station not found' });
    const chargers = await Charger.find({ stationId: station._id }).lean();
    const available = chargers.filter((c) => c.status === 'available').length;
    res.json({ ...station, chargers, availableChargers: available, totalChargers: chargers.length });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to fetch station' });
  }
};
