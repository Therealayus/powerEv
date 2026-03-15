const express = require('express');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/adminAuth');
const {
  getUsers,
  getPartners,
  getPartnerById,
  getStations,
  getSessions,
  getDashboard,
  createStation,
  updateStation,
  updateTerms,
} = require('../controllers/adminController');

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get('/users', getUsers);
router.get('/partners', getPartners);
router.get('/partners/:id', getPartnerById);
router.get('/stations', getStations);
router.post('/stations', createStation);
router.put('/stations/:id', updateStation);
router.get('/sessions', getSessions);
router.get('/dashboard', getDashboard);
router.put('/terms', updateTerms);

module.exports = router;
