const express = require('express');
const Department = require('../models/Department');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const dept = new Department(req.body);
    await dept.save();
    res.json(dept);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/', verifyToken, requireRole(['admin','hod','dean','management_assistant']), async (req, res) => {
  const depts = await Department.find().populate('hod', 'name email');
  res.json(depts);
});

// Get specific department by ID
router.get('/:id', verifyToken, requireRole(['admin','hod','dean','management_assistant']), async (req, res) => {
  try {
    const department = await Department.findById(req.params.id).populate('hod', 'fullName email');
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update department
router.put('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const department = await Department.findByIdAndUpdate(id, updateData, { new: true });
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json({ message: 'Department updated successfully', department });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete department
router.delete('/:id', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    
    const department = await Department.findByIdAndDelete(id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
