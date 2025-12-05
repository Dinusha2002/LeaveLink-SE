const express = require('express');
const router = express.Router();

// Example dashboard route for Non-Academic Staff
router.get('/dashboard', async (req, res) => {
  // TODO: Replace with real data fetching logic
  res.json({
    message: 'Welcome Non-Academic Staff!',
    leaveRequests: [],
  });
});

module.exports = router;
