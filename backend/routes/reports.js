const express = require('express');
const LeaveRequest = require('../models/LeaveRequest');
const User = require('../models/User');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Query: /api/reports?from=2025-01-01&to=2025-01-31&department=<id>&userId=<id>
router.get('/', verifyToken, requireRole(['admin','hod','dean']), async (req, res) => {
  try {
    const { from, to, department, userId } = req.query;
    const match = { status: 'approved' };
    if (userId) match.applicant = userId;
    if (from || to) {
      match.startDate = {};
      if (from) match.startDate.$gte = new Date(from);
      if (to) match.startDate.$lte = new Date(to);
    }

    let pipeline = [{ $match: match }];
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'applicant',
        foreignField: '_id',
        as: 'applicant'
      }
    });
    pipeline.push({ $unwind: '$applicant' });

    if (department) {
      pipeline.push({ $match: { 'applicant.department': require('mongoose').Types.ObjectId(department) } });
    }

    pipeline.push({
      $group: {
        _id: '$applicant._id',
        name: { $first: '$applicant.name' },
        email: { $first: '$applicant.email' },
        totalDays: { $sum: '$days' },
        requests: { $push: '$$ROOT' }
      }
    });

    const results = await LeaveRequest.aggregate(pipeline);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Error generating report' });
  }
});

module.exports = router;
