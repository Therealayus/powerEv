/**
 * Create or promote the first admin user.
 * Set ADMIN_EMAIL and ADMIN_PASSWORD in .env, then run:
 *   node src/scripts/create-admin.js
 * (from backend folder)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create an admin user.');
    process.exit(1);
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging');
    let user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (user) {
      user.role = 'admin';
      await user.save({ validateBeforeSave: false });
      console.log('Existing user promoted to admin:', email);
    } else {
      user = await User.create({
        name: 'Admin',
        email: email.toLowerCase().trim(),
        password,
        role: 'admin',
        emailVerified: true,
      });
      console.log('Admin user created:', email);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();
