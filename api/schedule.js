const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  day: String,
  morning: [String],
  evening: [String],
  open: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

const Schedule = mongoose.model('Schedule', ScheduleSchema);

const DEFAULT_SCHEDULE = [
  { day: 'ראשון', morning: ['10:30','12:30'], evening: ['20:30','22:30'], open: true },
  { day: 'שני',   morning: ['10:30','12:30'], evening: ['20:00','22:00'], open: true },
  { day: 'שלישי', morning: ['10:30','12:30'], evening: ['20:00','22:00'], open: true },
  { day: 'רביעי', morning: ['10:30','12:30'], evening: ['20:00','22:00'], open: true },
  { day: 'חמישי', morning: ['10:30','12:30'], evening: [], open: true },
];

router.get('/', async (req, res) => {
  try {
    let schedule = await Schedule.find();
    if (!schedule.length) {
      schedule = await Schedule.insertMany(DEFAULT_SCHEDULE);
    }
    res.json(schedule);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:day', async (req, res) => {
  try {
    const s = await Schedule.findOneAndUpdate(
      { day: req.params.day },
      { ...req.body, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json(s);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
