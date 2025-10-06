require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Department = require('./models/Department');
const LeaveType = require('./models/LeaveType');

async function main() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

  // Optionally clear collections
  // await User.deleteMany({});
  // await Department.deleteMany({});
  // await LeaveType.deleteMany({});

  // Departments to seed
  const departmentNames = [
    'Information Technology',
    'Information System',
    'Architecture',
    'Quantity Survey',
    'Industrial And Quality Management',
    'Survey Sciences'
  ];

  // Upsert departments and collect their docs
  const departments = {};
  for (const name of departmentNames) {
    const dept = await Department.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true }
    );
    departments[name] = dept;
  }

  if (!departments['Information Technology'] || !departments['Information Technology']._id) {
    throw new Error('Department "Information Technology" not found');
  }

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('admin123', salt);
  const lectPass = await bcrypt.hash('lect123', salt);
  const assistPass = await bcrypt.hash('assist123', salt);
  const hodPass = await bcrypt.hash('hod123', salt);

  // Example: assign Lecturer and HOD to "Information Technology"
  const users = [
    { name: 'Admin User', email: 'admin@example.com', role: 'admin', passwordHash: adminPass },
    { 
      name: 'Lecturer One', 
      email: 'lecturer@example.com', 
      role: 'lecturer', 
      passwordHash: lectPass, 
      department: departments['Information Technology']._id,
      appointmentDate: new Date('2025-09-01') // Example appointment date
    },
    { name: 'Assistant One', email: 'assistant@example.com', role: 'management_assistant', passwordHash: assistPass },
    { name: 'HOD One', email: 'hod@leavelink.local', role: 'hod', passwordHash: hodPass, department: departments['Information Technology']._id, fullName: 'Dr. Sarah Johnson' }
  ];

  for (const u of users) {
    try {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const nu = new User(u);
        await nu.save();
        console.log('Created user:', u.email);
      } else {
        console.log('User exists:', u.email);
      }
    } catch (err) {
      console.error('Error creating user:', u.email, err.message);
    }
  }

  const leaveTypes = ['Annual', 'Casual', 'Duty', 'Lieu', 'Maternity'];
  for (const name of leaveTypes) {
    const lt = await LeaveType.findOne({ name });
    if (!lt) {
      await new LeaveType({ name, maxDays: 365 }).save();
      console.log('Created leave type:', name);
    }
  }

  console.log('Seed complete');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });