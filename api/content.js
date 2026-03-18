const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ContentSchema = new mongoose.Schema({
  type: { type: String, enum: ['news', 'tip'], required: true },
  title: String,
  body: String,
  date: String,
  num: String,
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Content = mongoose.model('Content', ContentSchema);

// GET all news
router.get('/news', async (req, res) => {
  try {
    const items = await Content.find({ type: 'news' }).sort({ createdAt: -1 });
    if (!items.length) {
      return res.json([
        { _id: '1', title: 'לו"ז שבועי עלה לאוויר', body: 'שעות הבוקר והערב זמינות לקביעה. ימי ראשון–חמישי פתוחים.', date: '17 מרץ 2026' },
        { _id: '2', title: 'שיפורים במערכת הקביעה', body: 'אישורים ישירות לוואטסאפ תוך שניות מסיום הקביעה.', date: '10 מרץ 2026' },
      ]);
    }
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET all tips
router.get('/tips', async (req, res) => {
  try {
    const items = await Content.find({ type: 'tip' }).sort({ order: 1, createdAt: 1 });
    if (!items.length) {
      return res.json([
        { _id: '1', num: '01', title: 'EQ לפני Compressor', body: 'תמיד תנקה את הצליל עם EQ לפני שאתה מדחס — Compressor מגביר גם את הבעיות.' },
        { _id: '2', num: '02', title: 'Gain Staging נכון', body: 'שמור על רמות כניסה בין -18 ל-12 dBFS. Headroom נכון שווה מיקס נקי.' },
        { _id: '3', num: '03', title: 'מעברים חלקים', body: 'תרגל מעבר בין שירים ב-phrase של 8 beats. תן לאנרגיה לעלות לאט.' },
      ]);
    }
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST new item
router.post('/', async (req, res) => {
  try {
    const item = new Content(req.body);
    await item.save();
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE item
router.delete('/:id', async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT - replace all tips (reorder)
router.put('/tips', async (req, res) => {
  try {
    await Content.deleteMany({ type: 'tip' });
    const items = req.body.map((item, i) => ({ ...item, type: 'tip', order: i }));
    await Content.insertMany(items);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT - replace all news
router.put('/news', async (req, res) => {
  try {
    await Content.deleteMany({ type: 'news' });
    await Content.insertMany(req.body.map(item => ({ ...item, type: 'news' })));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
