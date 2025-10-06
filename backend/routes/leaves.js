const express = require('express');
const LeaveRequest = require('../models/LeaveRequest');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Lecturer applies for leave
router.post('/', verifyToken, requireRole(['lecturer']), async (req, res) => {
  try {
    const { leaveType, startDate, endDate, days, reason } = req.body;
    const lr = new LeaveRequest({
      applicant: req.user.id,
      leaveType,
      startDate,
      endDate,
      days,
      reason,
      status: 'pending'
    });
    await lr.save();
    res.json(lr);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error applying for leave' });
  }
});

// Management Assistant: list pending (pending -> checked)
router.get('/pending', verifyToken, requireRole(['management_assistant']), async (req, res) => {
  const list = await LeaveRequest.find({ status: 'pending' }).populate('applicant leaveType checkedBy approvedBy');
  res.json(list);
});

router.put('/:id/check', verifyToken, requireRole(['management_assistant']), async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ msg: 'Not found' });
    leave.status = 'checked';
    leave.checkedBy = req.user.id;
    await leave.save();
    return res.json(leave);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Error' }); }
});

// HoD/Dean approve
router.get('/checked', verifyToken, requireRole(['hod','dean']), async (req, res) => {
  const list = await LeaveRequest.find({ status: 'checked' }).populate('applicant leaveType checkedBy approvedBy');
  res.json(list);
});

router.put('/:id/approve', verifyToken, requireRole(['hod','dean']), async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ msg: 'Not found' });
    leave.status = 'approved';
    leave.approvedBy = req.user.id;
    await leave.save();
    return res.json(leave);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Error' }); }
});

router.put('/:id/reject', verifyToken, requireRole(['hod','dean']), async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ msg: 'Not found' });
    leave.status = 'rejected';
    leave.approvedBy = req.user.id;
    await leave.save();
    return res.json(leave);
  } catch (err) { console.error(err); res.status(500).json({ msg: 'Error' }); }
});

// Admin/Assistants/HOD/Dean can get all leaves (with optional query filters)
router.get('/', verifyToken, requireRole(['admin','management_assistant','hod','dean']), async (req, res) => {
  const { status, department, from, to, userId } = req.query;
  const q = {};
  if (status) q.status = status;
  if (userId) q.applicant = userId;
  if (from || to) {
    q.startDate = {};
    if (from) q.startDate.$gte = new Date(from);
    if (to) q.startDate.$lte = new Date(to);
  }
  // department filter requires lookup - keep simple for now
  const list = await LeaveRequest.find(q).populate('applicant leaveType checkedBy approvedBy');
  res.json(list);
});

module.exports = router;
