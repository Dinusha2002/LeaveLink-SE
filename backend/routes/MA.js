const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Management Assistant creates Lecturer
router.post('/create', async (req, res) => {
  const { name, email, password, department, appointmentDate } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Lecturer already exists' });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const lecturer = new User({
    name,
    email,
    role: 'lecturer',
    passwordHash,
    department,
    appointmentDate
  });

  await lecturer.save();
  res.json({ message: 'Lecturer account created' });
});

// Example dashboard route for Management Assistant
router.get('/dashboard', async (req, res) => {
  // TODO: Replace with real data fetching logic
  res.json({
    message: 'Welcome Management Assistant!',
    activities: [],
  });
});

module.exports = router;