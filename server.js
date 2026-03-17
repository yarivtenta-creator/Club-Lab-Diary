require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// API Routes
app.use('/api/appointments', require('./api/appointments'));
app.use('/api/clients', require('./api/clients'));
app.use('/api/schedule', require('./api/schedule'));

// Admin page - before static middleware
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/admin/index.html'));
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
