const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const { Case } = require('../models');


// GET ALL CASES
router.get('/', auth, async (req, res) => {

  try {

    const cases = await Case.find()
      .populate('accountId', 'name')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    res.json(cases);

  } catch (err) {

    console.error(err.message);

    res.status(500).send('Server Error');

  }

});


// CREATE CASE
router.post('/', auth, async (req, res) => {

  try {

    const newCase = new Case({

      title: req.body.title,

      accountId: req.body.accountId,

      type: req.body.type,

      status: req.body.status || 'New',

      priority: req.body.priority || 'Medium',

      assignedTo: req.body.assignedTo,

      description: req.body.description,

      tags: req.body.tags || []

    });

    const savedCase = await newCase.save();

    res.json(savedCase);

  } catch (err) {

    console.error(err.message);

    res.status(500).send('Server Error');

  }

});


// UPDATE CASE STATUS
router.patch('/:id', auth, async (req, res) => {

  try {

    const updatedCase = await Case.findByIdAndUpdate(

      req.params.id,

      { status: req.body.status },

      { new: true }

    );

    res.json(updatedCase);

  } catch (err) {

    console.error(err.message);

    res.status(500).send('Server Error');

  }

});

module.exports = router;