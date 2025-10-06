const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Department = require('../models/Department');
const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email and populate department
    const user = await User.findOne({ email }).populate('department');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: '8h' }
    );

    // Return user data (excluding password) with token
    const { passwordHash, ...userData } = user.toObject();
    
    // Debug: Log department information
    console.log('User department data:', {
      department: userData.department,
      departmentType: typeof userData.department,
      departmentName: userData.department?.name
    });
    
    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Registration endpoint
router.post('/register', async (req, res) => {
  try {
    const {
      fullName, epf, nic, appointmentDate, gender,
      role, roleType, department, password, username, email,
      serviceNumber, contactNumber, homeAddress, sex, position
    } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password and role are required' });
    }

    // Check for existing user by epf or username or email
    const exists = await User.findOne({ 
      $or: [ 
        { epf }, 
        { username }, 
        { email }
      ] 
    });
    if (exists) {
      return res.status(400).json({ 
        message: 'User with EPF, Username, or Email already exists' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Handle department for academic staff
    let departmentId = undefined;
    if (roleType === 'academic' && department) {
      // Try to find existing department by name
      let existingDept = await Department.findOne({ name: department });
      if (!existingDept) {
        // Create new department if it doesn't exist
        existingDept = new Department({ name: department });
        await existingDept.save();
        console.log('Created new department:', department);
      }
      departmentId = existingDept._id;
    }

    // Handle HOD position - if position is HOD, create as academic staff but with HOD access
    let finalRole = role;
    let finalRoleType = roleType || (role === 'academic' ? 'academic' : 'non-academic');
    let isHODUser = false;
    
    if (position && position.toLowerCase().includes('hod')) {
      // HOD users are created as academic staff but with HOD access
      finalRole = 'academic'; // Set as academic staff (not hod)
      finalRoleType = 'academic';
      isHODUser = true; // Flag to indicate they have HOD access
    }

    const user = new User({
      fullName: fullName,
      initials: fullName,
      epf, 
      nic, 
      appointment: appointmentDate,
      appointmentDate: appointmentDate,
      gender: gender || sex,
      sex: sex || gender,
      role: finalRole, 
      roleType: finalRoleType,
      position: position,
      department: departmentId,
      passwordHash, 
      username, 
      email,
      serviceNumber: serviceNumber || epf,
      contactNumber: contactNumber || "",
      homeAddress: homeAddress || "",
      hasHODAccess: isHODUser // Flag to indicate HOD access for role switching
    });

    await user.save();
    const { passwordHash: _, ...savedUser } = user.toObject();
    
    console.log('User created successfully:', {
      username: savedUser.username,
      role: savedUser.role,
      roleType: savedUser.roleType,
      department: savedUser.department
    });
    
    res.status(201).json({
      message: 'Registration successful',
      user: savedUser
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

