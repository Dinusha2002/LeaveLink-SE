const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const corsOptions = require('./corsConfig');

const app = express();

app.use(cors(corsOptions)); // Enable CORS for frontend-backend communication
app.use(express.json()); // Parse JSON requests

mongoose.connect('mongodb://localhost:27017/leavelink', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/user');
app.use('/api/user', userRoutes);

const lecturerRoutes = require('./routes/lecturer');
app.use('/api/lecturer', lecturerRoutes);

const maAuthRoutes = require('./routes/maAuth');
app.use('/api/ma', maAuthRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));