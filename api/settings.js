const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  value: String
});
const Setting = mongoose.model('Setting', SettingSchema);

// GET all settings
router.get('/', async (req, res) => {
  try {
    const settings = await Setting.find();
    res.json(settings);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST save/update setting
router.post('/', async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await Setting.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, new: true }
    );
    res.json(setting);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
