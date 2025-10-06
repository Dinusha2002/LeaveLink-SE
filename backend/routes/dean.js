const express = require('express');
const router = express.Router();

// Example dashboard route for Dean
router.get('/dashboard', async (req, res) => {
  // TODO: Replace with real data fetching logic
  res.json({
    message: 'Welcome Dean!',
    facultyInfo: {},
    leaveRequests: [],
  });
});

module.exports = router;