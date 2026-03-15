const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    vehicleType: {
      type: String,
      default: 'EV',
      trim: true,
    },
    role: {
      type: String,
      enum: ['user', 'partner', 'admin'],
      default: 'user',
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // Profile & charging info (India)
    profilePhoto: { type: String, default: null, trim: true },
    phone: { type: String, default: '', trim: true },
    vehicleNumber: { type: String, default: '', trim: true },
    connectorType: {
      type: String,
      enum: ['', 'Bharat AC', 'Bharat DC', 'CCS 2', 'CHAdeMO', 'Type 2 AC'],
      default: '',
    },
    termsAcceptedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
