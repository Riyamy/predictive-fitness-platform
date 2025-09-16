const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  workout: String,
  nutrition: String,
  sleep: Number,
  performance: Number
});

module.exports = mongoose.model('Activity', ActivitySchema);
