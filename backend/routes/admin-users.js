const express = require('express');
const router = express.Router();
const StandardUser = require('../models/StandardUser');
const User = require('../models/User');
const Company = require('../models/Company');
const { sendApprovalNotification } = require('../utils/emailService');

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

// GET all client accounts (Business Clients)
router.get('/clients', async (req, res) => {
    try {
        const clients = await User.find({ role: 'client' })
            .populate('companyId')
            .sort({ createdAt: -1 });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// UPDATE CLIENT & COMPANY DETAILS
router.put('/clients/:id', async (req, res) => {
    try {
        const { name, email, phone, roleInCompany, preferredLanguage, timezone, company } = req.body;

        // Find user
        let user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Update user fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (roleInCompany) user.roleInCompany = roleInCompany;
        if (preferredLanguage) user.preferredLanguage = preferredLanguage;
        if (timezone) user.timezone = timezone;
        await user.save();

        // Update company fields if provided
        if (company && user.companyId) {
            await Company.findByIdAndUpdate(user.companyId, {
                $set: {
                    name: company.name,
                    website: company.website,
                    industry: company.industry,
                    employeesCount: company.employeesCount,
                    budgetRange: company.budgetRange,
                    servicesNeeded: company.servicesNeeded
                }
            });
        }

        res.json({ msg: 'Client and Company details updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

// UPDATE USER DETAILS (StandardUser)
router.put('/users/:id', async (req, res) => {
    try {
        const { name, email, phone, role } = req.body;

        const user = await StandardUser.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (role) user.role = role;

        await user.save();
        res.json({ msg: 'User details updated successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
});

// APPROVE / REJECT CLIENT
router.patch('/clients/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // Approved / Rejected
        const user = await User.findById(req.params.id).populate('companyId');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        if (user.companyId) {
            await Company.findByIdAndUpdate(user.companyId._id, { approvalStatus: status });

            // Send email
            sendApprovalNotification(user.email, user.name, status).catch(err =>
                console.error('Email status update error:', err.message)
            );
        }

        res.json({ msg: `Client account ${status}` });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// APPROVE / REJECT USER (StandardUser)
router.patch('/users/:id/status', async (req, res) => {
    try {
        const { status } = req.body; // approved / rejected / pending

        const user = await StandardUser.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (user && (status === 'approved' || status === 'rejected')) {
            const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);
            sendApprovalNotification(user.email, user.name, displayStatus).catch(err =>
                console.error('Email status update error:', err.message)
            );
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

module.exports = router;