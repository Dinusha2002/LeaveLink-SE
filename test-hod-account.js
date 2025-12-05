// Test script to create and verify HOD account
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./backend/models/User');

async function createHODAccount() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://127.0.0.1:27017/leave_link');
    console.log('✅ Connected to MongoDB');

    // Check if HOD account already exists
    const existingHOD = await User.findOne({ email: 'hod@leavelink.local' });
    
    if (existingHOD) {
      console.log('🏢 HOD account already exists:');
      console.log('   Email:', existingHOD.email);
      console.log('   Name:', existingHOD.fullName);
      console.log('   Role:', existingHOD.role);
      console.log('   Position:', existingHOD.position);
      console.log('   Department:', existingHOD.department);
    } else {
      // Create HOD account
      const hodPassword = 'HOD@12345';
      const hodHash = await bcrypt.hash(hodPassword, 10);
      
      const hodUser = await User.create({
        fullName: 'Dr. John Smith',
        email: 'hod@leavelink.local',
        username: 'hod.smith',
        role: 'hod',
        position: 'HOD',
        hodRole: 'hod',
        department: 'Information Technology',
        epf: 'HOD001',
        nic: '123456789V',
        appointmentDate: '2020-01-15',
        gender: 'male',
        passwordHash: hodHash
      });
      
      console.log('🏢 HOD account created successfully:');
      console.log('   Email:', hodUser.email);
      console.log('   Password:', hodPassword);
      console.log('   Name:', hodUser.fullName);
      console.log('   Role:', hodUser.role);
      console.log('   Position:', hodUser.position);
      console.log('   Department:', hodUser.department);
    }

    // Test login credentials
    console.log('\n🔐 Login Credentials:');
    console.log('   Email: hod@leavelink.local');
    console.log('   Password: HOD@12345');
    console.log('\n🌐 Access the HOD Management at: http://localhost:5173/hod');

  } catch (error) {
    console.error('❌ Error creating HOD account:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run the script
createHODAccount();
