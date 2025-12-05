const express = require('express');
const router = express.Router();

// Example dashboard route for HOD
router.get('/dashboard', async (req, res) => {
  // TODO: Replace with real data fetching logic
  res.json({
    message: 'Welcome Head Of Department!',
    departmentInfo: {},
    leaveRequests: [],
  });
});

module.exports = router;