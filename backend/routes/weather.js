const router = require('express').Router();
const axios = require('axios');

// GET /api/weather?city=Delhi  OR  /api/weather?lat=28.6&lon=77.2
router.get('/', async (req, res) => {
  try {
    const { city = 'Delhi', lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      return res.status(503).json({ error: 'Weather service not configured. Set OPENWEATHER_API_KEY in .env' });
    }

    let currentUrl, forecastUrl;
    if (lat && lon) {
      currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${apiKey}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&appid=${apiKey}&units=metric`;
    } else {
      currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
      forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
    }

    const [currentRes, forecastRes] = await Promise.all([
      axios.get(currentUrl),
      axios.get(forecastUrl)
    ]);

    const recommendations = generateWeatherRecommendations(currentRes.data);

    res.json({
      current: currentRes.data,
      forecast: forecastRes.data.list.slice(0, 8),
      recommendations
    });
  } catch (error) {
    if (error.response?.status === 404) {
      return res.status(404).json({ error: 'City not found. Please check the city name.' });
    }
    if (error.response?.status === 401) {
      return res.status(401).json({ error: 'Invalid weather API key.' });
    }
    console.error('Weather API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

function generateWeatherRecommendations(weather) {
  const recommendations = [];
  const temp = weather.main.temp;
  const humidity = weather.main.humidity;
  const windSpeed = weather.wind.speed;
  const description = weather.weather[0].main.toLowerCase();

  // Temperature-based
  if (temp > 42) {
    recommendations.push({ type: 'danger', text: 'Extreme heat alert! Provide shade for nurseries and livestock. Irrigate only during evening/early morning. Avoid field work during 11 AM - 4 PM.' });
  } else if (temp > 35) {
    recommendations.push({ type: 'warning', text: 'Hot weather: Increase irrigation frequency. Apply mulch around plants to retain soil moisture. Consider foliar spray of KCl (1%) to reduce heat stress.' });
  } else if (temp > 25) {
    recommendations.push({ type: 'good', text: 'Favorable temperature for most Kharif crops. Good conditions for field operations and crop growth.' });
  } else if (temp > 15) {
    recommendations.push({ type: 'good', text: 'Ideal temperature for Rabi crops like wheat, mustard, and vegetables. Good growing conditions.' });
  } else if (temp > 5) {
    recommendations.push({ type: 'warning', text: 'Cool weather: Good for wheat grain filling. Protect vegetable nurseries with plastic covers at night.' });
  } else {
    recommendations.push({ type: 'danger', text: 'Frost risk! Cover sensitive crops with straw or plastic sheets. Irrigate fields in evening to reduce frost damage. Avoid irrigation in early morning.' });
  }

  // Humidity-based
  if (humidity > 85) {
    recommendations.push({ type: 'warning', text: 'Very high humidity: High risk of fungal diseases (blast, blight, rust). Apply preventive fungicide spray. Ensure proper plant spacing for air circulation.' });
  } else if (humidity > 70) {
    recommendations.push({ type: 'info', text: 'Moderate-high humidity: Monitor crops for early disease symptoms. Good conditions for transplanting seedlings.' });
  } else if (humidity < 30) {
    recommendations.push({ type: 'warning', text: 'Very low humidity: Increase irrigation frequency. Use drip irrigation to minimize water loss. Apply mulch to conserve soil moisture.' });
  }

  // Weather condition-based
  if (description.includes('rain') || description.includes('drizzle')) {
    recommendations.push({ type: 'info', text: 'Rain expected: Postpone pesticide/fertilizer spraying (waste of chemicals). Ensure field drainage is clear. Good time for transplanting rice seedlings.' });
  } else if (description.includes('thunderstorm')) {
    recommendations.push({ type: 'danger', text: 'Thunderstorm alert: Stay indoors, avoid open fields. Secure livestock. Prop up tall crops to prevent lodging.' });
  } else if (description.includes('clear') || description.includes('sun')) {
    recommendations.push({ type: 'good', text: 'Clear skies: Ideal for spraying pesticides/fertilizers. Good for harvesting and drying grains. Plan irrigation in evening hours.' });
  } else if (description.includes('cloud')) {
    recommendations.push({ type: 'info', text: 'Cloudy weather: Reduced evaporation, skip irrigation if soil moisture is adequate. Good for transplanting operations.' });
  } else if (description.includes('mist') || description.includes('fog') || description.includes('haze')) {
    recommendations.push({ type: 'info', text: 'Foggy/misty conditions: Monitor for fungal diseases. Delay spraying until fog lifts. Good moisture retention for crops.' });
  }

  // Wind-based
  if (windSpeed > 12) {
    recommendations.push({ type: 'warning', text: 'Strong winds: Do not spray pesticides or herbicides (drift will waste chemicals and damage other crops). Support tall crops and banana plants.' });
  } else if (windSpeed > 7) {
    recommendations.push({ type: 'info', text: 'Moderate wind: Spray with caution, use low-drift nozzles. Good for grain drying operations.' });
  }

  if (recommendations.length === 0) {
    recommendations.push({ type: 'good', text: 'Weather conditions are favorable for general farming activities. Good time for field operations.' });
  }

  return recommendations;
}

module.exports = router;
