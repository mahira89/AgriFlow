import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CropInfo.css';

function CropInfo() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch crops from backend
  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5002/api/crops');
      setCrops(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching crops:', err);
      setError('Failed to load crop data. Using sample data instead.');
      // Fallback to sample data if backend fails
      setCrops(sampleCrops);
    } finally {
      setLoading(false);
    }
  };

  // Sample crop data as fallback
  const sampleCrops = [
    {
      name: 'Wheat',
      season: 'Rabi (Winter)',
      soilType: 'Well-drained loamy soil',
      waterRequirement: '4-5 irrigations',
      fertilizerSchedule: [
        { stage: 'Sowing', fertilizer: 'DAP', quantity: '50 kg/acre' },
        { stage: '20-25 days', fertilizer: 'Urea', quantity: '40 kg/acre' }
      ],
      commonPests: [
        { pestName: 'Aphids', symptoms: 'Curling leaves', treatment: 'Spray Imidacloprid' },
        { pestName: 'Rust', symptoms: 'Orange spots on leaves', treatment: 'Spray Mancozeb' }
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
        { stage: '30 days', fertilizer: 'Urea', quantity: '40 kg/acre' }
      ],
      commonPests: [
        { pestName: 'Stem Borer', symptoms: 'Dead heart', treatment: 'Carbofuran granules' },
        { pestName: 'Leaf Folder', symptoms: 'Leaves folded', treatment: 'Spray Chlorpyrifos' }
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
        { stage: '30 days', fertilizer: 'Urea', quantity: '30 kg/acre' }
      ],
      commonPests: [
        { pestName: 'Pink Bollworm', symptoms: 'Damaged bolls', treatment: 'Pheromone traps' },
        { pestName: 'Aphids', symptoms: 'Leaf curling', treatment: 'Spray Imidacloprid' }
      ],
      sowingTime: 'May-June',
      harvestTime: 'November-December',
      expectedYield: '8-10 quintals/acre'
    },
    {
      name: 'Tomato',
      season: 'All Season',
      soilType: 'Well-drained loamy',
      waterRequirement: 'Regular irrigation',
      fertilizerSchedule: [
        { stage: 'Planting', fertilizer: 'FYM', quantity: '10 ton/acre' },
        { stage: '30 days', fertilizer: 'NPK', quantity: '50 kg/acre' }
      ],
      commonPests: [
        { pestName: 'Fruit Borer', symptoms: 'Holes in fruits', treatment: 'Neem oil spray' },
        { pestName: 'Aphids', symptoms: 'Leaf curling', treatment: 'Spray Imidacloprid' }
      ],
      sowingTime: 'September-October',
      harvestTime: '90-100 days after sowing',
      expectedYield: '15-20 tons/acre'
    },
    {
      name: 'Potato',
      season: 'Rabi',
      soilType: 'Sandy loam',
      waterRequirement: 'Regular irrigation',
      fertilizerSchedule: [
        { stage: 'Planting', fertilizer: 'DAP', quantity: '60 kg/acre' },
        { stage: '30 days', fertilizer: 'Urea', quantity: '40 kg/acre' }
      ],
      commonPests: [
        { pestName: 'Aphids', symptoms: 'Leaf curling', treatment: 'Spray Imidacloprid' },
        { pestName: 'Late Blight', symptoms: 'Dark spots', treatment: 'Spray Mancozeb' }
      ],
      sowingTime: 'October-November',
      harvestTime: '90-110 days after sowing',
      expectedYield: '20-25 tons/acre'
    }
  ];

  return (
    <div className="crop-guide-container">
      <h2>🌱 Crop Guide</h2>
      <p>Select a crop to see detailed farming information</p>
      
      {loading && <div className="loading">Loading crops...</div>}
      {error && <div className="error">{error}</div>}
      
      <div className="crop-grid">
        {crops.map((crop, index) => (
          <div 
            key={index} 
            className={`crop-card ${selectedCrop?.name === crop.name ? 'selected' : ''}`}
            onClick={() => setSelectedCrop(crop)}
          >
            <h3>{crop.name}</h3>
            <p><strong>Season:</strong> {crop.season}</p>
            <p><strong>Soil:</strong> {crop.soilType}</p>
          </div>
        ))}
      </div>

      {selectedCrop && (
        <div className="crop-details">
          <h3>{selectedCrop.name} - Detailed Guide</h3>
          
          <div className="details-section">
            <h4>🌱 Basic Information</h4>
            <p><strong>Season:</strong> {selectedCrop.season}</p>
            <p><strong>Soil Type:</strong> {selectedCrop.soilType}</p>
            <p><strong>Water Requirement:</strong> {selectedCrop.waterRequirement}</p>
            <p><strong>Sowing Time:</strong> {selectedCrop.sowingTime}</p>
            <p><strong>Harvest Time:</strong> {selectedCrop.harvestTime}</p>
            <p><strong>Expected Yield:</strong> {selectedCrop.expectedYield}</p>
          </div>

          <div className="details-section">
            <h4>🧪 Fertilizer Schedule</h4>
            {selectedCrop.fertilizerSchedule?.map((item, idx) => (
              <div key={idx} className="info-item">
                <strong>{item.stage}:</strong> {item.fertilizer} - {item.quantity}
              </div>
            ))}
          </div>

          <div className="details-section">
            <h4>🐛 Common Pests & Treatment</h4>
            {selectedCrop.commonPests?.map((pest, idx) => (
              <div key={idx} className="pest-item">
                <strong>{pest.pestName}:</strong>
                <p><em>Symptoms:</em> {pest.symptoms}</p>
                <p><em>Treatment:</em> {pest.treatment}</p>
              </div>
            ))}
          </div>

          <button className="close-btn" onClick={() => setSelectedCrop(null)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default CropInfo;
