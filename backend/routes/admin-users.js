const express = require('express');
const router = express.Router();
const StandardUser = require('../models/StandardUser');

// GET all users (or filter by status)
router.get('/users', async (req, res) => {
    try {
        const { status } = req.query;

        const query = status ? { status } : {};
const users = await StandardUser.find(query)
    .populate('companyId', 'companyName name')
    .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// APPROVE / REJECT USER
router.patch('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // approved / rejected / pending

        const user = await StandardUser.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;