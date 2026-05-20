const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Deal } = require('../models');

// @route   POST api/deals
// @desc    Create a new deal
router.post('/', auth, async (req, res) => {
  try {
    const dealData = { ...req.body };

    // Auto-fill system fields
    dealData.createdBy = req.user.id;
    dealData.companyId = req.user.companyId;

    if (!dealData.assignedTo) {
      dealData.assignedTo = req.user.id;
    }

    const deal = new Deal(dealData);
    await deal.save();
    res.status(201).json(deal);
  } catch(err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// @route   PATCH api/deals/:id
// @desc    Update a deal (e.g. stage)
router.patch('/:id', auth, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(deal);
  } catch(err) {
    res.status(500).json({
      error: err.message
    });
  }
});

// @route   GET api/deals
// @desc    Get deals belonging to the logged-in user
// @route   GET api/deals
// @descGet deals belonging to the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const role = req.user?.role;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    let query = {};

    if (role === 'super_admin') {
      // Sees all
    } else if (role === 'admin' || role === 'client') {
      if (!companyId) return res.status(403).json({ msg: 'Unauthorized' });
      query.companyId = companyId;
    } else {
      // Staff sees only their own or assigned deals
      if (!companyId) return res.status(403).json({ msg: 'Unauthorized' });
      query.companyId = companyId;
      query.$or = [
        { assignedTo: userId },
        { createdBy: userId } // Assuming createdBy exists or we use assignedTo
      ];
    }

    const deals = await Deal.find(query)
      .populate('assignedTo', 'name')
      .populate('leadId');

    res.json(deals);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;