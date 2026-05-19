const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Invoice, Opportunity } = require('../models');

// @route   GET api/reports/invoice
router.get('/invoice', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find();
    
    // Total Invoiced, Collected, Outstanding
    const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.total, 0);
    const totalCollected = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.total, 0);
    const outstanding = totalInvoiced - totalCollected;

    // Aging (Simplified)
    const aging = {
      '1-30 Days': invoices.filter(i => i.status === 'Sent').reduce((acc, curr) => acc + curr.total, 0),
      '31-60 Days': 0,
      '61-90 Days': 0,
      '90+ Days': 0
    };

    // Revenue Over Time (Group by month)
    const revenueOverTime = {};
    invoices.forEach(i => {
      const month = new Date(i.createdAt).toLocaleString('default', { month: 'short' });
      revenueOverTime[month] = (revenueOverTime[month] || 0) + i.total;
    });

    res.json({
      totalInvoiced,
      totalCollected,
      outstanding,
      aging,
      revenueOverTime
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
