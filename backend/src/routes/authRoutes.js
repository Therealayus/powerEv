const express = require('express');
const {
  register,
  login,
  sendVerificationOtp,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  acceptTerms,
  deleteAccount,
  uploadProfilePhoto,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.post('/register', register);
router.post('/login', login);
router.post('/send-verification-otp', sendVerificationOtp);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.use(protect);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/terms-accept', acceptTerms);
router.delete('/account', deleteAccount);
router.post('/profile/photo', uploadProfilePhoto);

module.exports = router;
