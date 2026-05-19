const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Pricing } = require('../models');

// @route   GET api/pricing
// @desc    Get all pricing tiers
router.get('/', async (req, res) => {
  try {
    let pricing = await Pricing.find().sort({ usd: 1 });
    
    // Seed default data if empty
    if (pricing.length === 0) {
      const defaults = [
        { 
          tier: 'Basic', 
          usd: 120, 
          inr: 10000, 
          features: ['Basic CRM Access', 'Lead Management', 'Email Automation', 'Basic Reporting', 'Email Support', '1 GB Storage'], 
          setupInr: '2,50,000', 
          setupUsd: '3,000' 
        },
        { 
          tier: 'Growth', 
          usd: 181, 
          inr: 15000, 
          features: ['Advanced CRM Access', 'Lead Management & Scoring', 'WhatsApp + Email Automation', 'Advanced Reporting', 'Priority Support', '5 GB Storage', 'API Access'], 
          setupInr: '2,50,000', 
          setupUsd: '3,000' 
        },
        { 
          tier: 'Pro', 
          usd: 301, 
          inr: 25000, 
          features: ['Full CRM Access', 'Advanced Automation Flows', 'Multi-Channel Integration', 'Custom Reporting Dashboard', 'Dedicated Support', '10 GB Storage', 'Custom Integrations', 'Employee Tracking'], 
          setupInr: '5,00,000', 
          setupUsd: '6,000' 
        }
      ];
      await Pricing.insertMany(defaults);
      pricing = await Pricing.find().sort({ usd: 1 });
    }
    
    res.json(pricing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/pricing/:id
// @desc    Update pricing tier
router.put('/:id', auth, async (req, res) => {
  try {
    const pricing = await Pricing.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(pricing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
