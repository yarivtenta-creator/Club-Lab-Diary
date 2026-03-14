const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  visits: { type: Number, default: 0 },
  lastVisit: { type: Date, default: Date.now },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const Client = mongoose.model('Client', ClientSchema);

router.get('/', async (req, res) => {
  try {
    const clients = await Client.find().sort({ lastVisit: -1 });
    res.json(clients);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const client = new Client(req.body);
    await client.save();
    res.json(client);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.patch('/:id', async (req, res) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(client);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
