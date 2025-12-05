require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');

const app = express();
const PORT = process.env.PORT || 5000;

// Minimal custom CORS (adjust allow list if needed)
const allowList = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  (process.env.FRONTEND_URL || '').replace(/\/$/, '')
].filter(Boolean);

app.use((req, res, next) => {
  const origin = (req.headers.origin || '').replace(/\/$/, '');
  console.log(`🌐 CORS Request from origin: ${origin}`);
  console.log(`📋 Allowed origins:`, allowList);
  
  if (allowList.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    console.log(`✅ CORS allowed for: ${origin}`);
  } else {
    console.log(`❌ CORS blocked for: ${origin}`);
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

// Mongo connection with retry
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/leave_link';
async function connectWithRetry(attempt = 1) {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
    });
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    await seedAdmin();
  } catch (err) {
    const max = 5;
    console.error(`❌ MongoDB connection error (attempt ${attempt}):`, err.message);
    if (err.name === 'MongooseServerSelectionError') {
      console.error('💡 Make sure MongoDB is running. Start it with: mongod');
    }
    if (attempt < max) {
      const delay = attempt * 2000;
      console.log(`⏳ Retrying in ${delay/1000}s...`);
      setTimeout(() => connectWithRetry(attempt + 1), delay);
    } else {
      console.error('🚫 Could not connect to MongoDB after retries. Exiting.');
      console.error('💡 Please ensure MongoDB is installed and running on your system.');
      process.exit(1);
    }
  }
}
connectWithRetry();

// Seed admin and HOD (run only after successful connection)
async function seedAdmin() {
  // First, create or find the Information Technology department
  let itDepartment = await Department.findOne({ name: 'Information Technology' });
  if (!itDepartment) {
    itDepartment = await Department.create({
      name: 'Information Technology'
    });
    console.log('🏢 Information Technology department created');
  }

  // Create Admin account
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@leavelink.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await User.create({
      fullName: 'System Administrator',
      email: adminEmail,
      role: 'admin',
      passwordHash: hash
    });
    console.log(`🔐 Admin created: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log('🔐 Admin already exists');
  }

  // Create HOD account
  const hodEmail = 'hod@leavelink.local';
  const hodPassword = 'HOD@12345';
  const existingHOD = await User.findOne({ email: hodEmail });
  if (!existingHOD) {
    const salt = await bcrypt.genSalt(10);
    const hodHash = await bcrypt.hash(hodPassword, salt);
    await User.create({
      fullName: 'Head of Department',
      email: hodEmail,
      username: 'hod',
      role: 'hod',
      position: 'Head of Department',
      department: itDepartment._id,
      epf: 'HOD001',
      nic: '123456789V',
      appointmentDate: '2020-01-15',
      gender: 'male',
      passwordHash: hodHash
    });
    console.log(`🏢 HOD created: ${hodEmail} / ${hodPassword}`);
  } else {
    console.log('🏢 HOD already exists');
  }
}


// Health
app.get('/api/health', (req, res) => {
  const status = mongoose.connection.readyState;
  res.json({ status });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/departments', require('./routes/departments'));
app.use('/api/leaveTypes', require('./routes/leaveTypes'));

// Generic error
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});