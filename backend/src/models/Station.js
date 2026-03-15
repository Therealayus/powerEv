const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    name: {
      type: String,
      required: [true, 'Station name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
    },
    pricePerKwh: {
      type: Number,
      required: [true, 'Price per kWh is required'],
      min: 0,
    },
    totalChargers: {
      type: Number,
      required: [true, 'Total chargers is required'],
      min: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Station', stationSchema);
