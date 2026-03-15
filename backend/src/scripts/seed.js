/**
 * Seed script: creates sample stations and chargers for map display
 * Run: node src/scripts/seed.js (from backend folder, with MONGODB_URI set)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Station = require('../models/Station');
const Charger = require('../models/Charger');

const stations = [
  {
    name: 'Downtown EV Hub',
    address: '123 Main St, City Center',
    latitude: 37.7749,
    longitude: -122.4194,
    pricePerKwh: 0.35,
    totalChargers: 4,
  },
  {
    name: 'Highway 101 Supercharge',
    address: '500 Highway 101, North',
    latitude: 37.7849,
    longitude: -122.4094,
    pricePerKwh: 0.42,
    totalChargers: 8,
  },
  {
    name: 'Mall of EV Plaza',
    address: '200 Shopping Blvd',
    latitude: 37.7649,
    longitude: -122.4294,
    pricePerKwh: 0.38,
    totalChargers: 6,
  },
  {
    name: 'Airport Charging Center',
    address: '1 Airport Way',
    latitude: 37.7549,
    longitude: -122.4394,
    pricePerKwh: 0.45,
    totalChargers: 12,
  },
  {
    name: 'University Campus Station',
    address: '100 Campus Dr',
    latitude: 37.7949,
    longitude: -122.3994,
    pricePerKwh: 0.28,
    totalChargers: 4,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ev-charging');
    await Station.deleteMany({});
    await Charger.deleteMany({});

    for (const s of stations) {
      const station = await Station.create(s);
      const types = ['Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'];
      const powers = [11, 22, 50, 150];
      const count = Math.min(s.totalChargers, 4);
      for (let i = 0; i < count; i++) {
        await Charger.create({
          stationId: station._id,
          chargerType: types[i % types.length],
          powerKw: powers[i % powers.length],
          status: i === 0 ? 'available' : Math.random() > 0.3 ? 'available' : 'charging',
        });
      }
      // Ensure we have totalChargers
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
    console.log('Seed completed. Stations and chargers created.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
