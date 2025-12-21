// models/Food.js
const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
  hostelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  foodType: {
    type: String,
    enum: ['VEG', 'NON_VEG'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  availableUntil: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['AVAILABLE', 'CLAIMED', 'COLLECTED'],
    default: 'AVAILABLE'
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Food', foodSchema);