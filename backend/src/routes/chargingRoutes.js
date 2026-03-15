const express = require('express');
const { protect } = require('../middleware/auth');
const { startCharging, stopCharging, getHistory, getActive } = require('../controllers/chargingController');

const router = express.Router();
router.use(protect);
router.get('/active', getActive);
router.post('/start', startCharging);
router.post('/stop', stopCharging);
router.get('/history', getHistory);

module.exports = router;
