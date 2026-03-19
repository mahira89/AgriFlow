const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection - Updated for newer MongoDB driver
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/agriflow')
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.log('❌ MongoDB Connection Error:', err));
// Import Routes
const chatRoutes = require('./routes/chat');
const cropRoutes = require('./routes/crops');

// Use Routes
app.use('/api/chat', chatRoutes);
app.use('/api/crops', cropRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: '🌾 AgriFlow API is running!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
