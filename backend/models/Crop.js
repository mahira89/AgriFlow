const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  season: String,
  soilType: String,
  waterRequirement: String,
  fertilizerSchedule: [{
    stage: String,
    fertilizer: String,
    quantity: String
  }],
  commonPests: [{
    pestName: String,
    symptoms: String,
    treatment: String
  }],
  sowingTime: String,
  harvestTime: String,
  expectedYield: String,
  marketPrice: Number
});

module.exports = mongoose.model('Crop', cropSchema);
