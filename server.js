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

// Content Schema for Tips and News
const contentSchema = new mongoose.Schema({
  type: { type: String, enum: ['tip', 'news'], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'כללי' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Content = mongoose.model('Content', contentSchema);

// API Routes
app.use('/api/appointments', require('./api/appointments'));
app.use('/api/clients', require('./api/clients'));
app.use('/api/schedule', require('./api/schedule'));
app.use('/api/monthly', require('./api/monthly'));
app.use('/api/settings', require('./api/settings'));

// ===== CONTENT API (Tips & News) =====
app.get('/api/content/tips', async (req, res) => {
  try {
    const tips = await Content.find({ type: 'tip' }).sort({ createdAt: -1 }).limit(10);
    if (tips.length === 0) {
      return res.json({
        success: true,
        data: [
          { _id: '1', title: "טיפ של היום - קצב", description: "שמרו על קצב עדין בתחילת השיעור", category: "טכניקה" },
          { _id: '2', title: "טיפ של היום - ציוד", description: "בדקו את כל הציוד לפני השיעור", category: "הכנה" },
          { _id: '3', title: "טיפ של היום - כימיה", description: "התאמת המוזיקה למצב הרוח של הקבוצה", category: "פדגוגיה" }
        ]
      });
    }
    res.json({ success: true, data: tips });
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/content/news', async (req, res) => {
  try {
    const news = await Content.find({ type: 'news' }).sort({ createdAt: -1 }).limit(10);
    if (news.length === 0) {
      return res.json({
        success: true,
        data: [
          { _id: '1', title: "שיעורים חדשים זמינים", description: "הוספנו שיעורים חדשים בטכניקות מתקדמות", category: "עדכון" },
          { _id: '2', title: "תחרויות Club Lab", description: "השנה אנחנו מוזמנים לתחרויות בינלאומיות", category: "חדשות" },
          { _id: '3', title: "סדנה חדשה עם Ben", description: "סדנה בן-דרך בנושא ייצור מוזיקה", category: "אירוע" }
        ]
      });
    }
    res.json({ success: true, data: news });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/content/tips/:id', async (req, res) => {
  try {
    const tip = await Content.findById(req.params.id);
    if (!tip || tip.type !== 'tip') {
      return res.status(404).json({ success: false, error: 'Tip not found' });
    }
    res.json({ success: true, data: tip });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/content/news/:id', async (req, res) => {
  try {
    const newsItem = await Content.findById(req.params.id);
    if (!newsItem || newsItem.type !== 'news') {
      return res.status(404).json({ success: false, error: 'News not found' });
    }
    res.json({ success: true, data: newsItem });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/content/tips', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description required' });
    }
    const newTip = new Content({ type: 'tip', title, description, category: category || 'כללי' });
    await newTip.save();
    res.status(201).json({ success: true, data: newTip });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/content/news', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    if (!title || !description) {
      return res.status(400).json({ success: false, error: 'Title and description required' });
    }
    const newNews = new Content({ type: 'news', title, description, category: category || 'עדכון' });
    await newNews.save();
    res.status(201).json({ success: true, data: newNews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/content/tips/:id', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const tip = await Content.findByIdAndUpdate(
      req.params.id,
      { title, description, category, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ success: true, data: tip });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/content/news/:id', async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const news = await Content.findByIdAndUpdate(
      req.params.id,
      { title, description, category, updatedAt: Date.now() },
      { new: true }
    );
    res.json({ success: true, data: news });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/content/tips/:id', async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tip deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/content/news/:id', async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin page
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
