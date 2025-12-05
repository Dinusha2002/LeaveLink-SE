const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const LeaveType = require('../models/LeaveType');
const { verifyToken, requireRole } = require('../middleware/auth');
const router = express.Router();


// Get all users for admin dashboard
router.get('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .populate('department', 'name')
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users by department (for HOD dashboard)
router.get('/users/department/:departmentId', verifyToken, requireRole(['admin','hod','dean','management_assistant']), async (req, res) => {
  try {
    const { departmentId } = req.params;
    const users = await User.find({ department: departmentId })
      .populate('department', 'name')
      .select('-passwordHash')
      .sort({ fullName: 1 });
    
    res.json(users);
  } catch (error) {
    console.error('Error fetching users by department:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Get dashboard statistics
router.get('/dashboard-stats', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalDepartments = await Department.countDocuments();
    const totalLeaveTypes = await LeaveType.countDocuments();
    
    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    
    // Get users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    res.json({
      totalUsers,
      activeUsers,
      totalDepartments,
      totalLeaveTypes,
      recentUsers,
      usersByRole
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin-only user creation
router.post('/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    console.log('🔍 Admin create user request received:', req.body);
    console.log('👤 User making request:', req.user);
    console.log('🔑 Authorization header:', req.headers.authorization);
    
    const { 
      fullName, email, role, password, serviceNumber, contactNumber, nic, position, department,
      epf, appointmentDate, gender, sex, username, roleType
    } = req.body;
    
    console.log('📋 Parsed data:', { fullName, email, role, username, position, department });
    
    if (!email || !password || !role)
      return res.status(400).json({ message: 'email, password, role required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    
    // Handle department for academic staff
    let departmentId = undefined;
    if (roleType === 'academic' && department) {
      const Department = require('../models/Department');
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
      console.log('🏢 Creating HOD user with academic role and HOD access');
    }
    
    // Prepare user data
    const userData = {
      fullName,
      email,
      role: finalRole,
      roleType: finalRoleType,
      passwordHash: hash,
      serviceNumber: serviceNumber || epf,
      contactNumber: contactNumber || "",
      nic,
      position,
      department: departmentId,
      epf,
      appointmentDate,
      gender: gender || sex,
      sex: sex || gender,
      username,
      initials: fullName,
      homeAddress: "",
      hasHODAccess: isHODUser // Flag to indicate HOD access for role switching
    };

    console.log('📝 Final user data being created:', {
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
      position: userData.position,
      hasHODAccess: userData.hasHODAccess,
      department: userData.department
    });

    const user = await User.create(userData);
    const { passwordHash, ...userResponse } = user.toObject();
    
    console.log('✅ User created successfully:', {
      id: userResponse._id,
      name: userResponse.fullName,
      role: userResponse.role,
      position: userResponse.position,
      hasHODAccess: userResponse.hasHODAccess
    });
    
    // Get updated dashboard statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const totalDepartments = await Department.countDocuments();
    const totalLeaveTypes = await LeaveType.countDocuments();
    
    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });
    
    // Get users by role
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    const dashboardStats = {
      totalUsers,
      activeUsers,
      totalDepartments,
      totalLeaveTypes,
      recentUsers,
      usersByRole
    };
    
    res.status(201).json({ 
      message: 'User created successfully', 
      user: userResponse,
      dashboardStats: dashboardStats
    });
  } catch (e) {
    console.error('Admin create user error', e);
    res.status(500).json({ message: 'Server error' });
  }
});


// Update user
router.put('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Remove password from update data if present
    delete updateData.password;
    delete updateData.passwordHash;
    
    // Handle department update
    if (updateData.department && typeof updateData.department === 'string') {
      const Department = require('../models/Department');
      let department = await Department.findOne({ name: updateData.department });
      if (!department) {
        department = await Department.create({ name: updateData.department });
      }
      updateData.department = department._id;
    }
    
    const user = await User.findByIdAndUpdate(id, updateData, { new: true })
      .populate('department', 'name')
      .select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
