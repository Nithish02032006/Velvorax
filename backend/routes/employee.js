const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { User } = require('../models');

// @route   GET api/employee/stats
// @desc    Get all employees (Isolated by Company)
router.get('/stats', auth, async (req, res) => {
  try {
    let query = { role: 'staff' };

    // 🏢 COMPANY ISOLATION
    if (req.user.role !== 'super_admin') {
      if (!req.user.companyId) {
        return res.json([]); // Security: No company, no employees
      }
      query.companyId = req.user.companyId;
    }

    const employees = await User.find(query).select('-password');
    res.json(employees);
  } catch (err) {
    console.error("EMPLOYEE STATS ERROR:", err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/employee/activity
router.post('/activity', auth, async (req, res) => {
  try {
    const { userId, activity, type } = req.body;

    // Safety check: Don't allow logging activity for users in other companies
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if (req.user.role !== 'super_admin' && user.companyId.toString() !== req.user.companyId.toString()) {
       return res.status(403).json({ msg: 'Unauthorized activity log' });
    }

    if (!user.dailyActivityLog) user.dailyActivityLog = [];
    user.dailyActivityLog.push({ activity, type });
    await user.save();
    res.json(user.dailyActivityLog);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
