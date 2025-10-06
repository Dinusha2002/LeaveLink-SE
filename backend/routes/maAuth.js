const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register Management Assistant
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'User already exists' });

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = new User({
    name,
    email,
    role: 'management_assistant',
    passwordHash
  });

  await user.save();
  res.json({ message: 'Registration successful' });
});

// Login Management Assistant
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: 'management_assistant' });
  if (!user) return res.status(400).json({ message: 'Login failed' });
  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ message: 'Login failed' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

module.exports = router;