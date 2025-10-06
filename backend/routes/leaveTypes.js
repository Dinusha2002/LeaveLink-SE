const express = require('express');
const LeaveType = require('../models/LeaveType');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyToken, requireRole(['admin']), async (req, res) => {
  try {
    const lt = new LeaveType(req.body);
    await lt.save();
    res.json(lt);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  const list = await LeaveType.find();
  res.json(list);
});

module.exports = router;
