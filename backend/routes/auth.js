const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const { User, Company } = require('../models');
const { generateRegistrationPDF } = require('../utils/pdfGenerator');
const { sendRegistrationNotification, sendRegistrationConfirmation } = require('../utils/emailService');
const { sendRegistrationWhatsApp } = require('../utils/whatsappService');
const fs = require('fs');

// @route   POST api/auth/register
// @desc    Register company and admin user
router.post('/register', async (req, res) => {
  const {
    companyName, website, country, industry, employeesCount,
    servicesNeeded, budgetRange, projectTimeline, referralSource,
    name, email, password, phone, roleInCompany, preferredLanguage, timezone,
    logo
  } = req.body;

  console.log('-----------------------------------------');
  console.log('REGISTRATION ATTEMPT');
  console.log('Email:', email);
  console.log('Company:', companyName);

  try {
    let user = await User.findOne({ email });
    if (user) {
      console.log('Result: REGISTRATION FAILED - User already exists');
      return res.status(400).json({ msg: 'User already exists' });
    }

    const company = new Company({
      name: companyName,
      website,
      country,
      industry,
      employeesCount,
      servicesNeeded,
      budgetRange,
      projectTimeline,
      referralSource,
      logo
    });
    await company.save();
    console.log('Result: COMPANY CREATED');

    user = new User({
      companyId: company._id,
      name,
      email,
      password,
      phone,
      roleInCompany,
      preferredLanguage,
      timezone,
      role: 'client'
    });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    console.log('Result: USER CREATED SUCCESSFULLY');

    const payload = { user: { id: user.id, role: user.role, companyId: user.companyId, type: 'User' } };

    // Trigger PDF generation and Email Notifications in background
    (async () => {
      let pdfPath = null;
      try {
        pdfPath = await generateRegistrationPDF(req.body);

        // Notify Super Admins
        await sendRegistrationNotification(req.body, pdfPath);

        // Notify User (Registration Confirmation)
        await sendRegistrationConfirmation(email, name);

        // Notify User via WhatsApp
        await sendRegistrationWhatsApp({ name, phone, email });

        console.log('Background: Notifications sent for', companyName);
      } catch (error) {
        console.error('Background Error: Notification failed:', error.message);
      } finally {
        if (pdfPath && fs.existsSync(pdfPath)) {
          fs.unlinkSync(pdfPath); // Clean up temp file
        }
      }
    })();

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 });
    user.isLoggedIn = true;
    user.activeToken = token;
    await user.save();
    console.log('Result: REGISTRATION SUCCESSFUL - Token generated');
    console.log('-----------------------------------------');
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId, type: 'User' } });
  } catch (err) {
    console.error('Registration Error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('-----------------------------------------');
  console.log(`LOGIN ATTEMPT: ${email}`);

  try {
    let user = await User.findOne({ email });

    if (!user) {
      console.log(`Result: FAILED - Email not found: ${email}`);
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    console.log(`Result: USER FOUND. Role: ${user.role}`);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Result: FAILED - Password incorrect');
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    console.log('Result: PASSWORD MATCH SUCCESS');

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

    const payload = { user: { id: user.id, role: user.role, companyId: user.companyId, type: 'User' } };

    // Check for company approval status (except for super_admins)
    if (user.role !== 'super_admin') {
      const company = await Company.findById(user.companyId);
      if (!company) {
          console.log('Result: FAILED - Company record missing');
          return res.status(400).json({ msg: 'Company data missing.' });
      }

      console.log(`Result: Company Status is [${company.approvalStatus}]`);

      if (company.approvalStatus !== 'Approved') {
        console.log('Result: BLOCKED - Account not approved');
        return res.status(403).json({
          msg: `Your account is ${company.approvalStatus}. Please wait for Super Admin approval.`,
          status: company.approvalStatus
        });
      }
    }

    console.log('Result: LOGIN SUCCESSFUL');
    console.log('-----------------------------------------');

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: 360000 });
    user.isLoggedIn = true;
    user.activeToken = token;
    await user.save();

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, companyId: user.companyId, type: 'User' } });
  } catch (err) {
    console.error('Login Error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/logout
// @desc    Log current user out
router.post('/logout', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user) {
      user.isLoggedIn = false;
      user.activeToken = null;
      await user.save();
    }
    res.json({ msg: 'Logged out successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/auth/clear-sessions
router.post('/clear-sessions', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
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

// @route   GET api/auth/me
// @desc    Get user data
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
