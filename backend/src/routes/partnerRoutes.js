const express = require('express');
const { protect } = require('../middleware/auth');
const { partnerOnly } = require('../middleware/partnerAuth');
const {
  getMyStations,
  createStation,
  updateStation,
  getMySessions,
  getDashboard,
} = require('../controllers/partnerController');

const router = express.Router();
router.use(protect);
router.use(partnerOnly);

router.get('/dashboard', getDashboard);
router.get('/stations', getMyStations);
router.post('/stations', createStation);
router.put('/stations/:id', updateStation);
router.get('/sessions', getMySessions);

module.exports = router;
