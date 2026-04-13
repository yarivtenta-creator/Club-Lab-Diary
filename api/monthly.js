const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const DaySchema = new mongoose.Schema({
  date: { type: String, required: true, unique: true }, // format: YYYY-MM-DD
  open: { type: Boolean, default: false },
  slots: { type: [String], default: [] }, // e.g. ['10:30','12:30','20:00']
  updatedAt: { type: Date, default: Date.now }
});

const Day = mongoose.model('Day', DaySchema);

// GET month - returns all days for a given month
router.get('/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    const prefix = `${year}-${month.padStart(2,'0')}`;
    const days = await Day.find({ date: { $regex: `^${prefix}` } });
    res.json(days);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET single day
router.get('/day/:date', async (req, res) => {
  try {
    const day = await Day.findOne({ date: req.params.date });
    res.json(day || { date: req.params.date, open: false, slots: [] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET available slots for a date range (for landing page)
router.get('/available/:from/:to', async (req, res) => {
  try {
    const days = await Day.find({
      date: { $gte: req.params.from, $lte: req.params.to },
      open: true
    }).sort({ date: 1 });
    res.json(days);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT - update a single day
router.put('/day/:date', async (req, res) => {
  try {
    const day = await Day.findOneAndUpdate(
      { date: req.params.date },
      { ...req.body, date: req.params.date, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(day);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT - bulk update month
router.put('/month', async (req, res) => {
  try {
    const days = req.body; // array of { date, open, slots }
    await Promise.all(days.map(d =>
      Day.findOneAndUpdate(
        { date: d.date },
        { ...d, updatedAt: new Date() },
        { new: true, upsert: true }
      )
    ));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
