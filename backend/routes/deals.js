const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Deal } = require('../models');

// @route   POST api/deals
// @desc    Create a new deal
router.post('/', auth, async (req, res) => {
  try {
    // Ensure the deal is assigned to the person creating it if not specified
    const dealData = { ...req.body };
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
    // 1. Fetch all deals
    const deals = await Deal.find()
      .populate('assignedTo', 'name')
      .populate('leadId');

    const currentUserId = req.user.id.toString();

    // 2. Filter: Show deal if User is the Deal Owner OR the Lead Owner
    const filteredDeals = deals.filter(deal => {

      // Get the Deal's assigned user ID (check if it's an object from populate or a raw ID)
      const dealAssignedId = deal.assignedTo?._id
        ? deal.assignedTo._id.toString()
        : (deal.assignedTo ? deal.assignedTo.toString() : null);

      // Get the Lead's assigned user ID
      const leadAssignedId = deal.leadId?.assignedTo
        ? deal.leadId.assignedTo.toString()
        : null;

      // Logic: Show it if I own the deal OR I own the lead it came from
      return (dealAssignedId === currentUserId) || (leadAssignedId === currentUserId);
    });

    res.json(filteredDeals);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;