const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns');
require('dotenv').config();

// Use Google DNS for reliable SRV lookups (needed for MongoDB Atlas)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// Environment validation
if (!process.env.GEMINI_API_KEY) console.warn('⚠️  GEMINI_API_KEY not set — chat will use rule-based responses');
if (!process.env.OPENWEATHER_API_KEY) console.warn('⚠️  OPENWEATHER_API_KEY not set — weather features disabled');
if (!process.env.MONGODB_URI) console.warn('⚠️  MONGODB_URI not set — using local MongoDB');

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agriflow')
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => console.log('❌ MongoDB Connection Error:', err));

// Import Routes
const chatRoutes = require('./routes/chat');
const cropRoutes = require('./routes/crops');
const weatherRoutes = require('./routes/weather');

// Use Routes
app.use('/api/chat', chatRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/weather', weatherRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: '🌾 AgriFlow API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
