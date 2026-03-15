const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const {
  getUsers,
  getPartners,
  getStations,
  getSessions,
  getDashboard,
  updateTerms,
} = require('../controllers/adminController');

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/users', getUsers);
router.get('/partners', getPartners);
router.get('/stations', getStations);
router.get('/sessions', getSessions);
router.get('/dashboard', getDashboard);
router.put('/terms', updateTerms);

module.exports = router;
