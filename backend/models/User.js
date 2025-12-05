const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  serviceNumber: String,
  fullName: String,
  contactNumber: String,
  nic: String,
  email: { type: String, unique: true },
  homeAddress: String,
  sex: String,
  role: String,
  roleType: String,
  passwordHash: String,
  initials: String,
  epf: String,
  appointment: String,
  gender: String,
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  username: String,
  position: String,
  appointmentDate: Date,
  status: { type: String, default: 'active' },
  hasHODAccess: { type: Boolean, default: false } // Flag for HOD role switching access
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
