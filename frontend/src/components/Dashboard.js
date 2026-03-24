import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCommentDots, FaSeedling, FaCloudSun, FaRobot, FaDatabase, FaBolt, FaLeaf } from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from '../config';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/weather?city=Delhi`)
      .then(res => setWeather(res.data))
      .catch(() => {});
  }, []);

  const getSeasonalTip = () => {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 9) {
      return { season: 'Kharif', tip: 'Time for Rice, Cotton, Maize, Groundnut, and Soybean. Prepare fields for monsoon sowing.', color: '#2d6a4f' };
    } else if (month >= 9 || month <= 2) {
      return { season: 'Rabi', tip: 'Season for Wheat, Gram, Mustard, and Barley. Ensure proper irrigation setup.', color: '#e76f51' };
    } else {
      return { season: 'Zaid', tip: 'Grow short-duration crops like Watermelon, Cucumber, and Fodder crops.', color: '#f4a261' };
    }
  };

  const seasonal = getSeasonalTip();

  const quickActions = [
    { icon: FaCommentDots, title: 'Ask AgriFlow', desc: 'AI-powered farming advice', path: '/chat', color: '#2d6a4f' },
    { icon: FaSeedling, title: 'Crop Guide', desc: 'Detailed crop information', path: '/crops', color: '#40916c' },
    { icon: FaCloudSun, title: 'Weather', desc: 'Real-time weather & tips', path: '/weather', color: '#e76f51' },
  ];

  const features = [
    { icon: FaRobot, title: 'Gemini AI', desc: 'Powered by Google Gemini 2.0' },
    { icon: FaDatabase, title: 'RAG System', desc: '50+ agricultural knowledge docs' },
    { icon: FaBolt, title: 'Real-time', desc: 'Live weather-based advice' },
  ];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
  };

  return (
    <div className="dashboard">
      {/* Welcome Banner */}
      <motion.div
        className="welcome-banner"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="welcome-text">
          <h1>Welcome to AgriFlow <FaLeaf /></h1>
          <p>Your AI-powered farming assistant with real-time weather insights and expert agricultural knowledge.</p>
        </div>
        {weather && (
          <div className="weather-mini" onClick={() => navigate('/weather')}>
            <div className="weather-mini-temp">{Math.round(weather.current.main.temp)}°C</div>
            <div className="weather-mini-desc">{weather.current.weather[0].description}</div>
            <div className="weather-mini-city">{weather.current.name}</div>
          </div>
        )}
      </motion.div>

      {/* Season Banner */}
      <motion.div
        className="season-banner"
        style={{ borderLeftColor: seasonal.color }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <span className="season-tag" style={{ background: seasonal.color }}>{seasonal.season} Season</span>
        <p>{seasonal.tip}</p>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="section" variants={container} initial="hidden" animate="show">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action, i) => (
            <motion.div
              key={i}
              className="action-card"
              variants={item}
              whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.12)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(action.path)}
            >
              <div className="action-icon" style={{ background: action.color }}>
                <action.icon />
              </div>
              <h3>{action.title}</h3>
              <p>{action.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <motion.div className="section" variants={container} initial="hidden" animate="show">
        <h2 className="section-title">Powered By</h2>
        <div className="features-grid">
          {features.map((feat, i) => (
            <motion.div key={i} className="feature-card" variants={item}>
              <feat.icon className="feature-icon" />
              <h4>{feat.title}</h4>
              <p>{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default Dashboard;
