const mongoose = require('mongoose');

const chargerSchema = new mongoose.Schema(
  {
    stationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Station',
      required: true,
    },
    chargerType: {
      type: String,
      required: true,
      enum: ['Type 2', 'CCS', 'CHAdeMO', 'Tesla Supercharger'],
    },
    powerKw: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['available', 'charging', 'offline'],
      default: 'available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Charger', chargerSchema);
