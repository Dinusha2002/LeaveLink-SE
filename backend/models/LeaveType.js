const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  maxDays: { type: Number, default: 365 }
});

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
