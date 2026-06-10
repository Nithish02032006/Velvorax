const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const StandardUser = require('../models/StandardUser');
const { sendRegistrationConfirmation, sendApprovalNotification } = require('../utils/emailService');
const { sendRegistrationWhatsApp, sendApprovalWhatsApp } = require('../utils/whatsappService');
const { sendRegistrationCall, sendApprovalCall } = require('../utils/callService');

// Helper to find the Company/Business model dynamically
const getCompanyModel = () => {
    return mongoose.models.Company || mongoose.models.Business || mongoose.models.Client;
};

// @route   GET api/user-auth/companies
router.get('/companies', async (req, res) => {
    try {
        const CompanyModel = getCompanyModel();
        if (!CompanyModel) return res.status(500).json({ msg: "Company model not initialized" });
        const companies = await CompanyModel.find({}, 'companyName name _id');
        res.json(companies);
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
});

// @route   POST api/user-auth/register
router.post('/register', async (req, res) => {
    const { name, email, phone, password, companyId } = req.body;
    try {
        let user = await StandardUser.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new StandardUser({
            name, email, phone, password, companyId,
            role: 'staff', status: 'pending'
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        // Send registration confirmation email and WhatsApp in background
        sendRegistrationConfirmation(email, name).catch(err =>
            console.error('Email confirmation error:', err.message)
        );

        sendRegistrationWhatsApp({ name, phone, email }).catch(err =>
            console.error('WhatsApp registration error:', err.message)
        );

        sendRegistrationCall({ name, phone }).catch(err =>
            console.error('Call registration error:', err.message)
        );

        res.status(201).json({ msg: 'Registration successful. Pending approval.' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST api/user-auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await StandardUser.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        if (user.status === 'pending') return res.status(403).json({ msg: 'Your account is pending approval' });
        if (user.status === 'rejected') return res.status(403).json({ msg: 'Your account was rejected' });
        if (user.status !== 'approved') return res.status(403).json({ msg: 'Account not approved' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        // ✅ UNIFIED TOKEN STRUCTURE (Must match middleware)
        const payload = {
            user: {
                id: user._id,
                role: user.role,
                companyId: user.companyId,
                name: user.name,
                type: 'StandardUser'
            }
        };

    if (user.isLoggedIn && user.activeToken) {
    try {
        jwt.verify(user.activeToken, process.env.JWT_SECRET);

        // If last activity older than 15 mins → clear stale session
        const lastActive = user.updatedAt || user.createdAt;
        const diff = Date.now() - new Date(lastActive).getTime();

        if (diff < 15 * 60 * 1000) {
            return res.status(403).json({
                msg: 'User already logged in on another device'
            });
        }

        // stale session
        user.isLoggedIn = false;
        user.activeToken = null;
        await user.save();

    } catch (verifyErr) {
        user.isLoggedIn = false;
        user.activeToken = null;
        await user.save();
    }
}

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        user.isLoggedIn = true;
        user.activeToken = token;
        await user.save();

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                type: 'StandardUser',
                companyId: user.companyId
            }
        });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.get('/pending-users', async (req, res) => {
    try {
        const users = await StandardUser.find({ status: 'pending' })
            .select('name email phone companyId createdAt role status');
        res.json(users);
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.put('/approve/:id', async (req, res) => {
    try {
        const user = await StandardUser.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        user.status = 'approved';
        await user.save();

        // Send approval email and WhatsApp
        sendApprovalNotification(user.email, user.name, 'Approved').catch(err =>
            console.error('Approval email error:', err.message)
        );

        sendApprovalWhatsApp({ name: user.name, phone: user.phone }, 'Approved').catch(err =>
            console.error('Approval WhatsApp error:', err.message)
        );

        sendApprovalCall({ name: user.name, phone: user.phone }).catch(err =>
            console.error('Approval Call error:', err.message)
        );

        res.json({ msg: 'User approved successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.delete('/reject/:id', async (req, res) => {
    try {
        const user = await StandardUser.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: 'User not found' });

        // Send rejection email and WhatsApp before deleting
        sendApprovalNotification(user.email, user.name, 'Rejected').catch(err =>
            console.error('Rejection email error:', err.message)
        );

        sendApprovalWhatsApp({ name: user.name, phone: user.phone }, 'Rejected').catch(err =>
            console.error('Rejection WhatsApp error:', err.message)
        );

        await user.deleteOne();
        res.json({ msg: 'User rejected successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        const user = await StandardUser.findById(req.user.id);
        if (user) {
            user.isLoggedIn = false;
            user.activeToken = null;
            await user.save();
        }
        res.json({ msg: 'Logged out successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

// @route   POST api/user-auth/clear-sessions
router.post('/clear-sessions', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await StandardUser.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid Credentials' });

        user.isLoggedIn = false;
        user.activeToken = null;
        await user.save();

        res.json({ msg: 'All sessions cleared successfully. You can now login.' });
    } catch (err) {
        res.status(500).json({ msg: 'Server Error' });
    }
});

module.exports = router;