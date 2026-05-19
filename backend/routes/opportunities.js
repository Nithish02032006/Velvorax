const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Opportunity } = require('../models');

// @route   GET api/opportunities
router.get('/', auth, async (req, res) => {
  try {
    const opportunities = await Opportunity.find().populate('accountId').sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/opportunities
router.post('/', auth, async (req, res) => {
  try {
    const newOpp = new Opportunity(req.body);
    const opp = await newOpp.save();
    res.json(opp);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/opportunities/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const opp = await Opportunity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(opp);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
