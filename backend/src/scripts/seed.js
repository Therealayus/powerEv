/**
 * Single seed script: optional admin user + stations & chargers.
 * Run: npm run seed (from backend folder, with MONGODB_URI in .env)
 * Optional: set ADMIN_EMAIL and ADMIN_PASSWORD in .env to create or promote an admin user.
 */
require('dotenv').config();
const dns = require('dns');
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging';
if (uri.startsWith('mongodb+srv://')) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const User = require('../models/User');
const Station = require('../models/Station');
const Charger = require('../models/Charger');

const stations = [
  { name: 'Downtown EV Hub', address: '123 Main St, City Center', latitude: 37.7749, longitude: -122.4194, pricePerKwh: 0.35, totalChargers: 4 },
  { name: 'Highway 101 Supercharge', address: '500 Highway 101, North', latitude: 37.7849, longitude: -122.4094, pricePerKwh: 0.42, totalChargers: 8 },
  { name: 'Mall of EV Plaza', address: '200 Shopping Blvd', latitude: 37.7649, longitude: -122.4294, pricePerKwh: 0.38, totalChargers: 6 },
  { name: 'Airport Charging Center', address: '1 Airport Way', latitude: 37.7549, longitude: -122.4394, pricePerKwh: 0.45, totalChargers: 12 },
  { name: 'University Campus Station', address: '100 Campus Dr', latitude: 37.7949, longitude: -122.3994, pricePerKwh: 0.28, totalChargers: 4 },
];

async function ensureAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || !email.trim() || !password.trim()) return;
  const normalized = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalized }).select('+password');
  if (user) {
    user.role = 'admin';
    await user.save({ validateBeforeSave: false });
    console.log('Admin promoted:', normalized);
  } else {
    await User.create({
      name: 'Admin',
      email: normalized,
      password,
      role: 'admin',
      emailVerified: true,
    });
    console.log('Admin created:', normalized);
  }
}

async function seedStations() {
  await Station.deleteMany({});
  await Charger.deleteMany({});
  const types = ['Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'];
  const powers = [11, 22, 50, 150];
  for (const s of stations) {
    const station = await Station.create(s);
    const count = Math.min(s.totalChargers, 4);
    for (let i = 0; i < count; i++) {
      await Charger.create({
        stationId: station._id,
        chargerType: types[i % types.length],
        powerKw: powers[i % powers.length],
        status: i === 0 ? 'available' : Math.random() > 0.3 ? 'available' : 'charging',
      });
    }
    const existing = await Charger.countDocuments({ stationId: station._id });
    for (let i = existing; i < s.totalChargers; i++) {
      await Charger.create({
        stationId: station._id,
        chargerType: 'Type 2',
        powerKw: 22,
        status: 'available',
      });
    }
  }
  console.log('Stations and chargers seeded.');
}

async function run() {
  try {
    await mongoose.connect(uri);
    await ensureAdmin();
    await seedStations();
    console.log('Seed completed.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
