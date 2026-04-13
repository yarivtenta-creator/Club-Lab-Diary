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
    res.json(items);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET all tips
router.get('/tips', async (req, res) => {
  try {
    const items = await Content.find({ type: 'tip' }).sort({ order: 1, createdAt: 1 });
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

// PATCH - update item
router.patch('/:id', async (req, res) => {
  try {
    const item = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT - replace all tips (reorder)
router.put('/tips', async (req, res) => {
  try {
    await Content.deleteMany({ type: 'tip' });
    if(req.body && req.body.length > 0) {
      const items = req.body.map((item, i) => ({
        type: 'tip',
        title: item.title||'',
        body: item.body||'',
        num: item.num||String(i+1).padStart(2,'0'),
        order: i
      }));
      await Content.insertMany(items);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT - replace all news
router.put('/news', async (req, res) => {
  try {
    await Content.deleteMany({ type: 'news' });
    if(req.body && req.body.length > 0) {
      const items = req.body.map(item => ({
        type: 'news',
        title: item.title||'',
        body: item.body||'',
        date: item.date||''
      }));
      await Content.insertMany(items);
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
