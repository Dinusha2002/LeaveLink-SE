const express = require('express');
const router = express.Router();

// Example dashboard route for Lecturer
router.get('/dashboard', async (req, res) => {
  // TODO: Replace with real data fetching logic
  res.json({
    message: 'Welcome Lecturer!',
    leaveRequests: [],
  });
});

module.exports = router;