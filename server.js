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
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Seed default tips and news if empty
    try {
      const tipCount = await Content.countDocuments({ type: 'tip' });
      const newsCount = await Content.countDocuments({ type: 'news' });
      
      if (tipCount === 0) {
        await Content.insertMany([
          { type: 'tip', title: "טיפ של היום - קצב", description: "שמרו על קצב עדין בתחילת השיעור", category: "טכניקה" },
          { type: 'tip', title: "טיפ של היום - ציוד", description: "בדקו את כל הציוד לפני השיעור", category: "הכנה" },
          { type: 'tip', title: "טיפ של היום - כימיה", description: "התאמת המוזיקה למצב הרוח של הקבוצה", category: "פדגוגיה" }
        ]);
        console.log('📌 Default tips seeded');
      }
      
      if (newsCount === 0) {
        await Content.insertMany([
          { type: 'news', title: "שיעורים חדשים זמינים", description: "הוספנו שיעורים חדשים בטכניקות מתקדמות", category: "עדכון" },
          { type: 'news', title: "תחרויות Club Lab", description: "השנה אנחנו מוזמנים לתחרויות בינלאומיות", category: "חדשות" },
          { type: 'news', title: "סדנה חדשה עם Ben", description: "סדנה בן-דרך בנושא ייצור מוזיקה", category: "אירוע" }
        ]);
        console.log('📰 Default news seeded');
      }
    } catch (e) {
      console.error('Seeding error:', e.message);
    }
  })
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
      return res.json([
        { num: '01', title: "טיפ של היום - קצב", body: "שמרו על קצב עדין בתחילת השיעור" },
        { num: '02', title: "טיפ של היום - ציוד", body: "בדקו את כל הציוד לפני השיעור" },
        { num: '03', title: "טיפ של היום - כימיה", body: "התאמת המוזיקה למצב הרוח של הקבוצה" }
      ]);
    }
    const formatted = tips.map((t, i) => ({
      num: String(i + 1).padStart(2, '0'),
      title: t.title,
      body: t.description
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching tips:', error);
    res.status(500).json([]);
  }
});

app.get('/api/content/news', async (req, res) => {
  try {
    const news = await Content.find({ type: 'news' }).sort({ createdAt: -1 }).limit(10);
    if (news.length === 0) {
      return res.json([
        { date: new Date().toISOString().split('T')[0], title: "שיעורים חדשים זמינים", body: "הוספנו שיעורים חדשים בטכניקות מתקדמות" },
        { date: new Date().toISOString().split('T')[0], title: "תחרויות Club Lab", body: "השנה אנחנו מוזמנים לתחרויות בינלאומיות" },
        { date: new Date().toISOString().split('T')[0], title: "סדנה חדשה עם Ben", body: "סדנה בן-דרך בנושא ייצור מוזיקה" }
      ]);
    }
    const formatted = news.map(n => ({
      date: n.createdAt ? n.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      title: n.title,
      body: n.description
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json([]);
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
