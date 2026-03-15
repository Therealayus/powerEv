/**
 * MongoDB connection configuration
 * Uses Mongoose for ODM and connection pooling
 */
const dns = require('dns');
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MongoDB connection error: MONGODB_URI is not set in .env');
    process.exit(1);
  }
  // Use Google DNS for Atlas SRV lookup when system DNS blocks/fails (e.g. querySrv ECONNREFUSED)
  if (uri.startsWith('mongodb+srv://')) {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    const msg = error.message || '';
    if (msg.includes('querySrv ECONNREFUSED')) {
      console.error(
        'MongoDB connection error: DNS SRV lookup failed. Use the Standard (non-SRV) connection string from Atlas: Connect → Drivers → "Connect using MongoDB Compass" or use the Standard format. See .env.example.'
      );
    } else {
      console.error('MongoDB connection error:', msg);
    }
    process.exit(1);
  }
};

module.exports = connectDB;
