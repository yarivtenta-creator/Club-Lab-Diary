require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

app.use('/api/appointments', require('./api/appointments'));
app.use('/api/clients', require('./api/clients'));
app.use('/api/schedule', require('./api/schedule'));
app.use('/api/monthly', require('./api/monthly'));
app.use('/api/settings', require('./api/settings'));
app.use('/api/content', require('./api/content'));

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/admin/index.html')));
app.get('/admin/', (req, res) => res.sendFile(path.join(__dirname, 'public/admin/index.html')));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
