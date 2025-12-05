const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware to require a specific user role or array of roles
function requireRole(role) {
  return (req, res, next) => {
    console.log('🔍 Checking role requirement:', { required: role, user: req.user });
    
    if (!req.user) {
      console.log('❌ No user found');
      return res.status(403).json({ message: 'Forbidden: No user found' });
    }
    
    // Handle both single role and array of roles
    const allowedRoles = Array.isArray(role) ? role : [role];
    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      console.log('❌ Insufficient role:', { userRole, allowedRoles });
      return res.status(403).json({ message: 'Forbidden: Insufficient role' });
    }
    
    console.log('✅ Role check passed');
    next();
  };
}

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  console.log('🔍 Auth header:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  console.log('🔑 Extracted token:', token ? 'Token exists' : 'No token');
  
  if (!token) {
    console.log('❌ No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'devsecret', (err, user) => {
    if (err) {
      console.log('❌ Invalid token:', err.message);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log('✅ Token verified, user:', user);
    req.user = user;
    next();
  });
}

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid)
      return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '8h' }
    );
    const { passwordHash, ...userData } = user.toObject();
    res.json({ message: 'Login successful', token, user: userData });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Public user registration (non-admin)
router.post('/register', async (req, res) => {
  try {
    const {
      serviceNumber,
      fullName,
      contactNumber,
      nic,
      email,
      homeAddress,
      sex,
      role,
      password
    } = req.body;

    if (role === 'admin')
      return res.status(403).json({ message: 'Cannot self-register admin' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      serviceNumber,
      fullName,
      contactNumber,
      nic,
      email,
      homeAddress,
      sex,
      role,
      passwordHash
    });

    await user.save();
    res.status(201).json({ message: 'Registration successful' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = {
  requireRole,
  verifyToken,
  router
};