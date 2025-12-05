const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');

// Management Assistant creates Lecturer with appointment date and credentials
router.post('/create-lecturer', async (req, res) => {
  const { name, email, password, departmentName, appointmentDate } = req.body;

  // Find department by name
  const department = await Department.findOne({ name: departmentName });
  if (!department) return res.status(400).json({ message: 'Department not found' });

  // Check if lecturer already exists
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Lecturer already exists' });

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create lecturer
  const lecturer = new User({
    name,
    email,
    role: 'lecturer',
    passwordHash,
    department: department._id,
    appointmentDate
  });

  await lecturer.save();
  res.json({ message: 'Lecturer account created successfully' });
});

module.exports = router;