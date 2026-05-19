const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Product } = require('../models');

// @route   GET api/products
router.get('/', auth, async (req, res) => {
  try {
    const products = await Product.find().sort({ name: 1 });
    res.json(products);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/products
router.post('/', auth, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const product = await newProduct.save();
    res.json(product);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
