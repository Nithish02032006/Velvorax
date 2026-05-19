const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { RecurringInvoice } = require('../models');

// @route   GET api/recurring
router.get('/', auth, async (req, res) => {
  try {
    const recurring = await RecurringInvoice.find().sort({ nextDate: 1 });
    res.json(recurring);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/recurring
router.post('/', auth, async (req, res) => {
  try {
    const newRec = new RecurringInvoice(req.body);
    const saved = await newRec.save();
    res.json(saved);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
