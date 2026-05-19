const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');

// @route   POST api/partners/register
// @desc    Register a new partner
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, companyName, website, programType, message } = req.body;

        const newPartner = new Partner({
            name,
            email,
            phone,
            companyName,
            website,
            programType,
            message
        });

        const partner = await newPartner.save();
        res.json({ msg: 'Application submitted successfully!', partner });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/partners
// @desc    Get all partners (for admin)
// @access  Private/Admin (Should add auth middleware later)
router.get('/', async (req, res) => {
    try {
        const partners = await Partner.find().sort({ createdAt: -1 });
        res.json(partners);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PATCH api/partners/:id/status
// @desc    Update partner status
// @access  Private/Admin
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const partner = await Partner.findById(req.params.id);

        if (!partner) {
            return res.status(404).json({ msg: 'Partner not found' });
        }

        partner.status = status;
        await partner.save();

        res.json({ msg: 'Partner status updated', partner });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/partners/:id
// @desc    Delete a partner
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
    try {
        const partner = await Partner.findById(req.params.id);

        if (!partner) {
            return res.status(404).json({ msg: 'Partner not found' });
        }

        await Partner.findByIdAndDelete(req.params.id);

        res.json({ msg: 'Partner removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
