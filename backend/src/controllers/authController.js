const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const {
  sendPartnerWelcome,
  sendUserWelcome,
  sendEmailVerificationOtp,
  sendPasswordResetOtp,
} = require('../services/emailService');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const OTP_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

/**
 * POST /api/auth/register - creates user, sends verification OTP
 */
exports.register = async (req, res) => {
  try {
    const { name, email, password, vehicleType, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password required' });
    }
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    const user = await User.create({
      name,
      email,
      password,
      vehicleType: vehicleType || 'EV',
      role: role === 'partner' ? 'partner' : 'user',
      emailVerified: false,
    });
    const otp = generateOtp();
    await Otp.deleteMany({ email: user.email, type: 'email_verification' });
    await Otp.create({
      email: user.email,
      otp,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    });
    sendEmailVerificationOtp(user.email, otp).catch((err) =>
      console.warn('Verification OTP email failed:', err.message)
    );
    if (user.role === 'partner') {
      sendPartnerWelcome(user.email, user.name).catch((err) =>
        console.warn('Partner welcome email failed:', err.message)
      );
    } else {
      sendUserWelcome(user.email, user.name).catch((err) =>
        console.warn('User welcome email failed:', err.message)
      );
    }
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      vehicleType: user.vehicleType,
      role: user.role,
      emailVerified: user.emailVerified,
      token: generateToken(user._id),
      message: 'Check your email for verification code',
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

/**
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      vehicleType: user.vehicleType,
      role: user.role,
      emailVerified: user.emailVerified,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Login failed' });
  }
};

/**
 * POST /api/auth/send-verification-otp - resend OTP for email verification
 * Body: { email }
 */
exports.sendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    const otp = generateOtp();
    await Otp.deleteMany({ email: user.email, type: 'email_verification' });
    await Otp.create({
      email: user.email,
      otp,
      type: 'email_verification',
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    });
    sendEmailVerificationOtp(user.email, otp).catch((err) =>
      console.warn('Verification OTP email failed:', err.message)
    );
    res.json({ message: 'Verification code sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to send code' });
  }
};

/**
 * POST /api/auth/verify-email - verify email with OTP
 * Body: { email, otp }
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });
    const record = await Otp.findOne({
      email: email.toLowerCase().trim(),
      type: 'email_verification',
      otp: String(otp).trim(),
      expiresAt: { $gt: new Date() },
    });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }
    await User.updateOne({ email: record.email }, { emailVerified: true });
    await Otp.deleteMany({ email: record.email, type: 'email_verification' });
    const user = await User.findOne({ email: record.email });
    res.json({
      message: 'Email verified',
      emailVerified: true,
      token: generateToken(user._id),
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, emailVerified: true },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Verification failed' });
  }
};

/**
 * POST /api/auth/forgot-password - send OTP to email for password reset
 * Body: { email }
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(200).json({ message: 'If an account exists, a code has been sent to your email' });
    }
    const otp = generateOtp();
    await Otp.deleteMany({ email: user.email, type: 'password_reset' });
    await Otp.create({
      email: user.email,
      otp,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
    });
    sendPasswordResetOtp(user.email, otp).catch((err) =>
      console.warn('Password reset OTP email failed:', err.message)
    );
    res.json({ message: 'If an account exists, a code has been sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to send code' });
  }
};

/**
 * POST /api/auth/reset-password - set new password with OTP
 * Body: { email, otp, newPassword }
 */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP and new password required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const record = await Otp.findOne({
      email: email.toLowerCase().trim(),
      type: 'password_reset',
      otp: String(otp).trim(),
      expiresAt: { $gt: new Date() },
    });
    if (!record) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }
    const user = await User.findOne({ email: record.email }).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.password = newPassword;
    await user.save();
    await Otp.deleteMany({ email: record.email, type: 'password_reset' });
    res.json({ message: 'Password reset successful. You can now sign in.' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Reset failed' });
  }
};

/**
 * GET /api/auth/profile - get current user profile (protected)
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('name email vehicleType role emailVerified profilePhoto phone vehicleNumber connectorType termsAcceptedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to get profile' });
  }
};

/**
 * PUT /api/auth/profile - update profile (protected)
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, vehicleNumber, connectorType } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = String(phone).trim();
    if (vehicleNumber !== undefined) user.vehicleNumber = String(vehicleNumber).trim();
    if (connectorType !== undefined) {
      const allowed = ['', 'Bharat AC', 'Bharat DC', 'CCS 2', 'CHAdeMO', 'Type 2 AC'];
      user.connectorType = allowed.includes(connectorType) ? connectorType : '';
    }
    await user.save();
    const out = await User.findById(user._id)
      .select('name email vehicleType role emailVerified profilePhoto phone vehicleNumber connectorType termsAcceptedAt');
    res.json(out);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
};

/**
 * POST /api/auth/terms-accept - record terms acceptance (protected)
 */
exports.acceptTerms = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { termsAcceptedAt: new Date() },
      { new: true }
    ).select('name email vehicleType role emailVerified profilePhoto phone vehicleNumber connectorType termsAcceptedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to accept terms' });
  }
};

/**
 * DELETE /api/auth/account - delete account and all related data (protected)
 */
exports.deleteAccount = async (req, res) => {
  try {
    const Feedback = require('../models/Feedback');
    const ChargingSession = require('../models/ChargingSession');
    const userId = req.user._id;
    await ChargingSession.deleteMany({ user: userId });
    await Feedback.deleteMany({ user: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to delete account' });
  }
};

/**
 * POST /api/auth/profile/photo - upload profile photo (protected). Body: { base64: "data:image/...;base64,..." }
 */
exports.uploadProfilePhoto = async (req, res) => {
  try {
    const { base64 } = req.body;
    if (!base64 || typeof base64 !== 'string' || !base64.startsWith('data:image/')) {
      return res.status(400).json({ message: 'Valid base64 image required' });
    }
    const matches = base64.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) return res.status(400).json({ message: 'Invalid image format' });
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const data = Buffer.from(matches[2], 'base64');
    if (data.length > 3 * 1024 * 1024) return res.status(400).json({ message: 'Image too large (max 3MB)' });

    const uploadsDir = path.join(process.cwd(), 'uploads', 'profiles');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    const filename = `${req.user._id}-${Date.now()}.${ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, data);
    const photoUrl = `/uploads/profiles/${filename}`;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { profilePhoto: photoUrl },
      { new: true }
    ).select('name email vehicleType role emailVerified profilePhoto phone vehicleNumber connectorType termsAcceptedAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to upload photo' });
  }
};
