const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  name: String,
  phone: { type: String, required: true },
  type: { type: String, default: 'DJ מתחיל' },
  day: String,
  date: String,
  time: String,
  status: { type: String, default: 'pending' }, // pending, confirmed, cancelled
  createdAt: { type: Date, default: Date.now }
});

const Appointment = mongoose.model('Appointment', AppointmentSchema);

// GET all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET today's appointments
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    const dateStr = today.getDate() + '.' + (today.getMonth() + 1);
    const appointments = await Appointment.find({ date: dateStr }).sort({ time: 1 });
    res.json(appointments);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST new appointment (from landing page)
router.post('/', async (req, res) => {
  try {
    const appt = new Appointment(req.body);
    await appt.save();

    // Auto-create or update client
    const Client = mongoose.model('Client');
    let client = await Client.findOne({ phone: req.body.phone });
    if (!client) {
      client = new Client({
        name: req.body.name || 'לקוח חדש',
        phone: req.body.phone,
        visits: 1,
        lastVisit: new Date()
      });
    } else {
      client.visits += 1;
      client.lastVisit = new Date();
    }
    await client.save();

    res.json({ success: true, appointment: appt });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PATCH update status
router.patch('/:id', async (req, res) => {
  try {
    const appt = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(appt);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE
router.delete('/:id', async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

module.exports = router;
