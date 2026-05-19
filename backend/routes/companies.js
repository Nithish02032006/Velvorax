const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Company, User } = require('../models');
const { sendApprovalNotification } = require('../utils/emailService');

// @route   GET api/companies
// @desc    Get companies based on role with filters
router.get('/', auth, async (req, res) => {
  try {
    const { industry, country, status, startDate, endDate } = req.query;
    let query = {};
    
    // Role-based base query
    if (req.user.role === 'super_admin') {
      query = {};
    } else if (req.user.role === 'client') {
      query = { $or: [{ _id: req.user.companyId }, { parentId: req.user.companyId }] };
    } else {
      query = { _id: req.user.companyId };
    }

    // Apply additional filters
    if (industry && industry !== 'All') query.industry = industry;
    if (country) query.country = new RegExp(country, 'i');
    if (status && status !== 'All') query.approvalStatus = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const companies = await Company.find(query).sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/companies
// @desc    Create a new company
router.post('/', auth, async (req, res) => {
  try {
    const companyData = { ...req.body };
    
    if (req.user.role === 'client') {
      companyData.parentId = req.user.companyId;
    }

    if (req.user.role === 'super_admin') {
      companyData.approvalStatus = 'Approved';
    }

    const newCompany = new Company(companyData);
    const company = await newCompany.save();
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/companies/:id
// @desc    Update company details
router.put('/:id', auth, async (req, res) => {
  try {
    let company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ msg: 'Company not found' });

    if (req.user.role !== 'super_admin' && req.user.companyId !== req.params.id) {
       if (req.user.role === 'client' && company.parentId?.toString() !== req.user.companyId) {
         return res.status(401).json({ msg: 'Unauthorized' });
       }
    }

    company = await Company.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PATCH api/companies/:id/:status
// @desc    Update company approval status
router.patch('/:id/:status', auth, async (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(401).json({ msg: 'Unauthorized' });
  const { id, status } = req.params;
  
  if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status' });
  }

  try {
    const company = await Company.findByIdAndUpdate(id, { approvalStatus: status }, { new: true });
    if (!company) return res.status(404).json({ msg: 'Company not found' });

    const user = await User.findOne({ companyId: id, role: 'admin' });
    if (user && (status === 'Approved' || status === 'Rejected')) {
      sendApprovalNotification(user.email, user.name, status).catch(err => {
        console.error('Failed to send approval email:', err.message);
      });
    }

    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/companies/:id
// @desc    Delete a company
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'super_admin') return res.status(401).json({ msg: 'Unauthorized' });
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ msg: 'Company not found' });
    res.json({ msg: 'Company removed' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
