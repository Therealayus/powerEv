const express = require('express');
const { getStations, getStationById } = require('../controllers/stationController');
const { getChargersByStation } = require('../controllers/chargerController');

const router = express.Router();
router.get('/', getStations);
router.get('/:id', getStationById);
router.get('/:id/chargers', getChargersByStation);

module.exports = router;
