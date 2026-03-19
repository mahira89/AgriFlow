const router = require('express').Router();
const Crop = require('../models/Crop');

// Sample crop data
const sampleCrops = [
  {
    name: 'Wheat',
    season: 'Rabi (Winter)',
    soilType: 'Well-drained loamy soil',
    waterRequirement: '4-5 irrigations',
    fertilizerSchedule: [
      { stage: 'Sowing', fertilizer: 'DAP', quantity: '50 kg/acre' },
      { stage: '20-25 days', fertilizer: 'Urea', quantity: '40 kg/acre' },
      { stage: '45-50 days', fertilizer: 'Urea', quantity: '30 kg/acre' }
    ],
    commonPests: [
      { pestName: 'Aphids', symptoms: 'Curling leaves, sticky substance', treatment: 'Spray Imidacloprid (0.5ml/liter)' },
      { pestName: 'Rust', symptoms: 'Orange/brown pustules on leaves', treatment: 'Spray Mancozeb (2g/liter)' }
    ],
    sowingTime: 'October-November',
    harvestTime: 'March-April',
    expectedYield: '20-25 quintals/acre'
  },
  {
    name: 'Rice',
    season: 'Kharif (Monsoon)',
    soilType: 'Clayey soil',
    waterRequirement: 'High (flood irrigation)',
    fertilizerSchedule: [
      { stage: 'Transplanting', fertilizer: 'DAP', quantity: '50 kg/acre' },
      { stage: 'Transplanting', fertilizer: 'Potash', quantity: '25 kg/acre' },
      { stage: '30 days', fertilizer: 'Urea', quantity: '40 kg/acre' },
      { stage: '60 days', fertilizer: 'Urea', quantity: '30 kg/acre' }
    ],
    commonPests: [
      { pestName: 'Stem Borer', symptoms: 'Dead heart in tillers', treatment: 'Carbofuran granules (10 kg/acre)' },
      { pestName: 'Leaf Folder', symptoms: 'Leaves folded and damaged', treatment: 'Spray Chlorpyrifos (2ml/liter)' }
    ],
    sowingTime: 'June-July',
    harvestTime: 'October-November',
    expectedYield: '25-30 quintals/acre'
  },
  {
    name: 'Cotton',
    season: 'Kharif',
    soilType: 'Black soil',
    waterRequirement: 'Moderate',
    fertilizerSchedule: [
      { stage: 'Sowing', fertilizer: 'DAP', quantity: '40 kg/acre' },
      { stage: 'Sowing', fertilizer: 'Potash', quantity: '20 kg/acre' },
      { stage: '30 days', fertilizer: 'Urea', quantity: '30 kg/acre' },
      { stage: '60 days', fertilizer: 'Urea', quantity: '30 kg/acre' }
    ],
    commonPests: [
      { pestName: 'Pink Bollworm', symptoms: 'Damaged bolls, pink larvae inside', treatment: 'Pheromone traps (8-10/acre)' },
      { pestName: 'Aphids', symptoms: 'Leaf curling, sooty mold', treatment: 'Spray Imidacloprid (0.5ml/liter)' }
    ],
    sowingTime: 'May-June',
    harvestTime: 'November-December',
    expectedYield: '8-10 quintals/acre'
  }
];

// Get all crops
router.get('/', async (req, res) => {
  try {
    // Check if crops exist, if not add sample data
    const count = await Crop.countDocuments();
    if (count === 0) {
      await Crop.insertMany(sampleCrops);
      console.log('✅ Sample crops added to database');
    }
    
    const crops = await Crop.find();
    res.json(crops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get crop by name
router.get('/:name', async (req, res) => {
  try {
    const crop = await Crop.findOne({ 
      name: { $regex: new RegExp(req.params.name, 'i') } 
    });
    
    if (!crop) {
      return res.json({ 
        message: 'Crop not found. Try wheat, rice, or cotton.' 
      });
    }
    
    res.json(crop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

