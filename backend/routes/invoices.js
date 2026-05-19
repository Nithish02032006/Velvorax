const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Invoice } = require('../models');

// @route   GET api/invoices
router.get('/', auth, async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/invoices
router.post('/', auth, async (req, res) => {
  try {
    const newInvoice = new Invoice(req.body);
    const invoice = await newInvoice.save();
    res.json(invoice);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/invoices/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(invoice);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/invoices/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    res.json(invoice);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
