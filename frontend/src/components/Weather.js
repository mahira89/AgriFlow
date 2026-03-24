import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaSearch, FaWind, FaTint, FaThermometerHalf, FaEye, FaMapMarkerAlt, FaExclamationTriangle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import axios from 'axios';
import API_BASE_URL from '../config';
import './Weather.css';

function Weather() {
  const [city, setCity] = useState('Delhi'); // eslint-disable-line no-unused-vars
  const [searchInput, setSearchInput] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async (searchCity) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/weather?city=${encodeURIComponent(searchCity)}`);
      setWeatherData(res.data);
      setCity(searchCity);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather('Delhi');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      fetchWeather(searchInput.trim());
      setSearchInput('');
    }
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'danger': return <FaExclamationTriangle style={{ color: '#e76f51' }} />;
      case 'warning': return <FaExclamationTriangle style={{ color: '#f4a261' }} />;
      case 'good': return <FaCheckCircle style={{ color: '#2d6a4f' }} />;
      default: return <FaInfoCircle style={{ color: '#457b9d' }} />;
    }
  };


  const formatForecastTime = (dtTxt) => {
    const date = new Date(dtTxt);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } }
  };
  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
  };

  return (
    <div className="weather-page">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="weather-title">Weather & Farming Forecast</h1>
        <p className="weather-subtitle">Real-time weather data with agriculture-specific recommendations</p>
      </motion.div>

      {/* Search */}
      <motion.form
        className="weather-search"
        onSubmit={handleSearch}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <FaMapMarkerAlt className="search-icon" />
        <input
          type="text"
          placeholder="Search city... (e.g., Mumbai, Lucknow, Jaipur)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit"><FaSearch /> Search</button>
      </motion.form>

      {error && <div className="weather-error">{error}</div>}

      {loading && (
        <div className="weather-loading">
          <div className="skeleton skeleton-main"></div>
          <div className="skeleton-row">
            <div className="skeleton skeleton-small"></div>
            <div className="skeleton skeleton-small"></div>
            <div className="skeleton skeleton-small"></div>
          </div>
        </div>
      )}

      {!loading && weatherData && (
        <motion.div variants={container} initial="hidden" animate="show">
          {/* Current Weather */}
          <motion.div className="current-weather" variants={item}>
            <div className="current-main">
              <div className="current-temp">
                {Math.round(weatherData.current.main.temp)}°
              </div>
              <div className="current-info">
                <h2>{weatherData.current.name}, {weatherData.current.sys.country}</h2>
                <p className="current-desc">{weatherData.current.weather[0].description}</p>
                <p className="feels-like">Feels like {Math.round(weatherData.current.main.feels_like)}°C</p>
              </div>
            </div>
            <div className="current-details">
              <div className="detail-item">
                <FaTint className="detail-icon" />
                <span className="detail-value">{weatherData.current.main.humidity}%</span>
                <span className="detail-label">Humidity</span>
              </div>
              <div className="detail-item">
                <FaWind className="detail-icon" />
                <span className="detail-value">{weatherData.current.wind.speed} m/s</span>
                <span className="detail-label">Wind</span>
              </div>
              <div className="detail-item">
                <FaThermometerHalf className="detail-icon" />
                <span className="detail-value">{Math.round(weatherData.current.main.temp_min)}° / {Math.round(weatherData.current.main.temp_max)}°</span>
                <span className="detail-label">Min / Max</span>
              </div>
              <div className="detail-item">
                <FaEye className="detail-icon" />
                <span className="detail-value">{(weatherData.current.visibility / 1000).toFixed(1)} km</span>
                <span className="detail-label">Visibility</span>
              </div>
            </div>
          </motion.div>

          {/* Forecast */}
          <motion.div variants={item}>
            <h3 className="section-heading">24-Hour Forecast</h3>
            <div className="forecast-scroll">
              {weatherData.forecast.map((f, i) => (
                <motion.div
                  key={i}
                  className="forecast-card"
                  variants={item}
                  whileHover={{ y: -3 }}
                >
                  <span className="forecast-time">{formatForecastTime(f.dt_txt)}</span>
                  <span className="forecast-temp">{Math.round(f.main.temp)}°</span>
                  <span className="forecast-desc">{f.weather[0].main}</span>
                  <span className="forecast-humidity"><FaTint /> {f.main.humidity}%</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Farming Recommendations */}
          <motion.div variants={item}>
            <h3 className="section-heading">Farming Recommendations</h3>
            <div className="recommendations">
              {weatherData.recommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  className={`recommendation-card rec-${rec.type}`}
                  variants={item}
                >
                  <div className="rec-icon">{getRecommendationIcon(rec.type)}</div>
                  <p>{rec.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Weather;
