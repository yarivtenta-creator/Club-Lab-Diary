require('dotenv').config();
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

// Tips endpoint - returns hardcoded defaults
app.get('/api/content/tips', (req, res) => {
  res.json([
    { num: '01', title: "טיפ של היום - קצב", body: "שמרו על קצב עדין בתחילת השיעור" },
    { num: '02', title: "טיפ של היום - ציוד", body: "בדקו את כל הציוד לפני השיעור" },
    { num: '03', title: "טיפ של היום - כימיה", body: "התאמת המוזיקה למצב הרוח של הקבוצה" }
  ]);
});

// News endpoint - returns hardcoded defaults
app.get('/api/content/news', (req, res) => {
  res.json([
    { date: new Date().toISOString().split('T')[0], title: "שיעורים חדשים זמינים", body: "הוספנו שיעורים חדשים בטכניקות מתקדמות" },
    { date: new Date().toISOString().split('T')[0], title: "תחרויות Club Lab", body: "השנה אנחנו מוזמנים לתחרויות בינלאומיות" },
    { date: new Date().toISOString().split('T')[0], title: "סדנה חדשה עם Ben", body: "סדנה בן-דרך בנושא ייצור מוזיקה" }
  ]);
});

app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public/admin/index.html')));
app.get('/admin/', (req, res) => res.sendFile(path.join(__dirname, 'public/admin/index.html')));
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
