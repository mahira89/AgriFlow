import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import './CropInfo.css';
import { FaTimes, FaSeedling, FaFlask, FaBug, FaCalendarAlt } from 'react-icons/fa';

const cropEmojis = {
  Wheat: '🌾', Rice: '🌱', Cotton: '🧶', Tomato: '🍅', Potato: '🥔',
  Onion: '🧅', Maize: '🌽', Sugarcane: '🎋', Banana: '🍌', Mango: '🥭',
  Chilli: '🌶️', Brinjal: '🍆', Groundnut: '🥜', Soybean: '🫘',
};

function CropInfo() {
  const [crops, setCrops] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sampleCrops = [
    { name: 'Wheat', season: 'Rabi (Winter)', soilType: 'Well-drained loamy soil', waterRequirement: '4-5 irrigations', fertilizerSchedule: [{ stage: 'Sowing', fertilizer: 'DAP', quantity: '50 kg/acre' }, { stage: '20-25 days', fertilizer: 'Urea', quantity: '40 kg/acre' }], commonPests: [{ pestName: 'Aphids', symptoms: 'Curling leaves', treatment: 'Spray Imidacloprid' }, { pestName: 'Rust', symptoms: 'Orange spots on leaves', treatment: 'Spray Mancozeb' }], sowingTime: 'October-November', harvestTime: 'March-April', expectedYield: '20-25 quintals/acre' },
    { name: 'Rice', season: 'Kharif (Monsoon)', soilType: 'Clayey soil', waterRequirement: 'High (flood irrigation)', fertilizerSchedule: [{ stage: 'Transplanting', fertilizer: 'DAP', quantity: '50 kg/acre' }, { stage: '30 days', fertilizer: 'Urea', quantity: '40 kg/acre' }], commonPests: [{ pestName: 'Stem Borer', symptoms: 'Dead heart', treatment: 'Carbofuran granules' }, { pestName: 'Leaf Folder', symptoms: 'Leaves folded', treatment: 'Spray Chlorpyrifos' }], sowingTime: 'June-July', harvestTime: 'October-November', expectedYield: '25-30 quintals/acre' },
    { name: 'Cotton', season: 'Kharif', soilType: 'Black soil', waterRequirement: 'Moderate', fertilizerSchedule: [{ stage: 'Sowing', fertilizer: 'DAP', quantity: '40 kg/acre' }, { stage: '30 days', fertilizer: 'Urea', quantity: '30 kg/acre' }], commonPests: [{ pestName: 'Pink Bollworm', symptoms: 'Damaged bolls', treatment: 'Pheromone traps' }, { pestName: 'Aphids', symptoms: 'Leaf curling', treatment: 'Spray Imidacloprid' }], sowingTime: 'May-June', harvestTime: 'November-December', expectedYield: '8-10 quintals/acre' },
    { name: 'Tomato', season: 'All Season', soilType: 'Well-drained loamy', waterRequirement: 'Regular irrigation', fertilizerSchedule: [{ stage: 'Planting', fertilizer: 'FYM', quantity: '10 ton/acre' }, { stage: '30 days', fertilizer: 'NPK', quantity: '50 kg/acre' }], commonPests: [{ pestName: 'Fruit Borer', symptoms: 'Holes in fruits', treatment: 'Neem oil spray' }, { pestName: 'Whitefly', symptoms: 'Leaf curl virus', treatment: 'Yellow sticky traps' }], sowingTime: 'September-October', harvestTime: '90-100 days after sowing', expectedYield: '15-20 tons/acre' },
    { name: 'Potato', season: 'Rabi', soilType: 'Sandy loam', waterRequirement: 'Regular irrigation', fertilizerSchedule: [{ stage: 'Planting', fertilizer: 'DAP', quantity: '60 kg/acre' }, { stage: '30 days', fertilizer: 'Urea', quantity: '40 kg/acre' }], commonPests: [{ pestName: 'Aphids', symptoms: 'Leaf curling', treatment: 'Spray Imidacloprid' }, { pestName: 'Late Blight', symptoms: 'Dark spots', treatment: 'Spray Mancozeb' }], sowingTime: 'October-November', harvestTime: '90-110 days after sowing', expectedYield: '20-25 tons/acre' },
  ];

  const fetchCrops = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/crops`);
      setCrops(response.data);
      setError(null);
    } catch (err) {
      setError('Using offline crop data');
      setCrops(sampleCrops);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCrops(); }, [fetchCrops]);

  const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

  return (
    <div className="crop-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="crop-title">Crop Guide</h1>
        <p className="crop-subtitle">Comprehensive farming information for major Indian crops</p>
      </motion.div>

      {loading && (
        <div className="crop-skeleton-grid">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton crop-skeleton-card"></div>
          ))}
        </div>
      )}

      {error && <div className="crop-notice">{error}</div>}

      {!loading && (
        <motion.div className="crop-grid" variants={container} initial="hidden" animate="show">
          {crops.map((crop, index) => (
            <motion.div
              key={index}
              className={`crop-card ${selectedCrop?.name === crop.name ? 'selected' : ''}`}
              variants={item}
              whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCrop(selectedCrop?.name === crop.name ? null : crop)}
            >
              <div className="crop-emoji">{cropEmojis[crop.name] || '🌿'}</div>
              <h3>{crop.name}</h3>
              <div className="crop-meta">
                <span><FaCalendarAlt /> {crop.season}</span>
                <span><FaSeedling /> {crop.soilType}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedCrop && (
          <motion.div
            className="crop-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedCrop(null)}
          >
            <motion.div
              className="crop-detail-panel"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="detail-header">
                <div>
                  <span className="detail-emoji">{cropEmojis[selectedCrop.name] || '🌿'}</span>
                  <h2>{selectedCrop.name}</h2>
                </div>
                <button className="detail-close" onClick={() => setSelectedCrop(null)}>
                  <FaTimes />
                </button>
              </div>

              <div className="detail-body">
                {/* Basic Info */}
                <div className="detail-section">
                  <h4><FaSeedling /> Basic Information</h4>
                  <div className="detail-grid">
                    <div className="detail-item"><span className="label">Season</span><span className="value">{selectedCrop.season}</span></div>
                    <div className="detail-item"><span className="label">Soil Type</span><span className="value">{selectedCrop.soilType}</span></div>
                    <div className="detail-item"><span className="label">Water</span><span className="value">{selectedCrop.waterRequirement}</span></div>
                    <div className="detail-item"><span className="label">Sowing</span><span className="value">{selectedCrop.sowingTime}</span></div>
                    <div className="detail-item"><span className="label">Harvest</span><span className="value">{selectedCrop.harvestTime}</span></div>
                    <div className="detail-item"><span className="label">Yield</span><span className="value">{selectedCrop.expectedYield}</span></div>
                  </div>
                </div>

                {/* Fertilizer */}
                {selectedCrop.fertilizerSchedule?.length > 0 && (
                  <div className="detail-section">
                    <h4><FaFlask /> Fertilizer Schedule</h4>
                    <div className="fert-list">
                      {selectedCrop.fertilizerSchedule.map((f, i) => (
                        <div key={i} className="fert-item">
                          <span className="fert-stage">{f.stage}</span>
                          <span className="fert-name">{f.fertilizer}</span>
                          <span className="fert-qty">{f.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pests */}
                {selectedCrop.commonPests?.length > 0 && (
                  <div className="detail-section">
                    <h4><FaBug /> Common Pests & Treatment</h4>
                    {selectedCrop.commonPests.map((pest, i) => (
                      <div key={i} className="pest-card">
                        <strong>{pest.pestName}</strong>
                        <p><em>Symptoms:</em> {pest.symptoms}</p>
                        <p><em>Treatment:</em> {pest.treatment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CropInfo;
