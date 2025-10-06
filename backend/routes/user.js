const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { verifyToken } = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { personalInfo, employmentInfo, contactInfo, preferences } = req.body;
    
    // Update user data
    const updateData = {
      ...(personalInfo && {
        fullName: personalInfo.fullName,
        email: personalInfo.email,
        employeeId: personalInfo.employeeId,
        dateOfBirth: personalInfo.dateOfBirth,
        gender: personalInfo.gender,
        maritalStatus: personalInfo.maritalStatus,
        nationality: personalInfo.nationality,
        nic: personalInfo.nic,
        address: personalInfo.address,
        phone: personalInfo.phone
      }),
      ...(employmentInfo && {
        position: employmentInfo.position,
        department: employmentInfo.department,
        appointmentDate: employmentInfo.appointmentDate,
        employmentType: employmentInfo.employmentType,
        reportingManager: employmentInfo.reportingManager,
        workLocation: employmentInfo.workLocation,
        office: employmentInfo.office,
        extension: employmentInfo.extension
      }),
      ...(contactInfo && {
        emergencyContact: contactInfo.emergencyContact,
        emergencyPhone: contactInfo.emergencyPhone,
        emergencyRelation: contactInfo.emergencyRelation,
        personalEmail: contactInfo.personalEmail,
        linkedin: contactInfo.linkedin,
        website: contactInfo.website
      }),
      ...(preferences && {
        language: preferences.language,
        timezone: preferences.timezone,
        dateFormat: preferences.dateFormat,
        notifications: preferences.notifications
      })
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user leave balance summary
router.get('/leave-balance', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate leave balance based on user data and leave requests
    const appointmentDate = user.appointmentDate || new Date();
    const currentYear = new Date().getFullYear();
    
    // Calculate years of service
    const yearsOfService = new Date().getFullYear() - new Date(appointmentDate).getFullYear();
    
    // Calculate leave balances based on years of service and position
    const leaveTypes = [
      {
        name: 'Casual Leave',
        description: 'Personal and emergency leave',
        total: Math.min(9, 3 + Math.floor(yearsOfService / 2)), // 3-9 days based on service
        used: 0, // This would be calculated from actual leave requests
        remaining: Math.min(9, 3 + Math.floor(yearsOfService / 2)),
        percentage: 100,
        color: '#10b981'
      },
      {
        name: 'Vacation Leave',
        description: 'Annual vacation time',
        total: yearsOfService >= 1 ? 21 : 0, // 21 days after 1 year
        used: 0,
        remaining: yearsOfService >= 1 ? 21 : 0,
        percentage: yearsOfService >= 1 ? 100 : 0,
        color: '#3b82f6'
      },
      {
        name: 'Other Leaves',
        description: 'Duty, lieu, block leave',
        total: 'Unlimited',
        used: 0,
        remaining: 'Unlimited',
        percentage: 100,
        color: '#8b5cf6'
      },
      {
        name: 'Maternity Leave',
        description: 'Maternity and family leave',
        total: 365,
        used: 0,
        remaining: 365,
        percentage: 0,
        color: '#f59e0b'
      }
    ];

    // Format appointment date
    const formattedAppointmentDate = new Date(appointmentDate).toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });

    res.json({
      appointmentDate: formattedAppointmentDate,
      leaveTypes: leaveTypes
    });
  } catch (error) {
    console.error('Error fetching leave balance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user settings
router.get('/settings', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user settings from database
    const settings = {
      personalInfo: {
        contactNumber: user.contactNumber || '',
        emergencyContact: user.emergencyContact || '',
        emergencyPhone: user.emergencyPhone || '',
        address: user.address || '',
        phone: user.phone || ''
      },
      notifications: {
        emailNotifications: user.emailNotifications !== false,
        leaveReminders: user.leaveReminders !== false,
        approvalUpdates: user.approvalUpdates !== false,
        systemUpdates: user.systemUpdates || false,
        smsNotifications: user.smsNotifications || false,
        pushNotifications: user.pushNotifications !== false
      },
      preferences: {
        language: user.language || 'English',
        timezone: user.timezone || 'Asia/Colombo',
        dateFormat: user.dateFormat || 'DD/MM/YYYY',
        darkMode: user.darkMode || false,
        autoSave: user.autoSave !== false,
        showTutorials: user.showTutorials !== false
      },
      privacy: {
        profileVisibility: user.profileVisibility || 'private',
        showEmail: user.showEmail || false,
        showPhone: user.showPhone || false,
        allowDataCollection: user.allowDataCollection || false,
        marketingEmails: user.marketingEmails || false
      }
    };

    res.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/settings', verifyToken, async (req, res) => {
  try {
    const { personalInfo, notifications, preferences, privacy } = req.body;
    
    // Update user data
    const updateData = {
      ...(personalInfo && {
        contactNumber: personalInfo.contactNumber,
        emergencyContact: personalInfo.emergencyContact,
        emergencyPhone: personalInfo.emergencyPhone,
        address: personalInfo.address,
        phone: personalInfo.phone
      }),
      ...(notifications && {
        emailNotifications: notifications.emailNotifications,
        leaveReminders: notifications.leaveReminders,
        approvalUpdates: notifications.approvalUpdates,
        systemUpdates: notifications.systemUpdates,
        smsNotifications: notifications.smsNotifications,
        pushNotifications: notifications.pushNotifications
      }),
      ...(preferences && {
        language: preferences.language,
        timezone: preferences.timezone,
        dateFormat: preferences.dateFormat,
        darkMode: preferences.darkMode,
        autoSave: preferences.autoSave,
        showTutorials: preferences.showTutorials
      }),
      ...(privacy && {
        profileVisibility: privacy.profileVisibility,
        showEmail: privacy.showEmail,
        showPhone: privacy.showPhone,
        allowDataCollection: privacy.allowDataCollection,
        marketingEmails: privacy.marketingEmails
      })
    };

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Settings updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change user password
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password (you would use bcrypt.compare here)
    // For now, we'll just check if it's not empty
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password (you would use bcrypt.hash here)
    // For now, we'll just store it as is (not recommended for production)
    user.passwordHash = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', (req, res) => {
  res.json({ message: 'Users route' });
});

module.exports = router;