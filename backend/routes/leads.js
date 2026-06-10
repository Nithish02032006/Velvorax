const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { Lead, User } = require('../models');
const { sendWhatsAppMessage } = require('../utils/whatsappService');
const {
  sendLeadNotificationToAdmin,
  sendLeadAutoResponseToLead
} = require('../utils/emailService');

// =========================
// PUBLIC LEAD CAPTURE (For Web Forms)
// =========================
router.post('/capture/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({ message: "Invalid Company ID" });
    }

    const {
      name, email, phone, company, requirement, source, message,
      address, budget, businessType, priority, industry, designation
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // SAFE LEAD ID GENERATION
    const lastLead = await Lead.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastLead?.leadId) {
      const parts = lastLead.leadId.split('-');
      const lastNumber = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }
    const leadId = `LD-${String(nextNumber).padStart(5, '0')}`;

    // AUTOMATION: Find primary admin to notify
    const adminUser = await User.findOne({ companyId, role: 'client' });

    const lead = new Lead({
      name,
      email,
      phone,
      company,
      address,
      budget: budget ? Number(budget) : 0,
      businessType,
      priority: priority || 'Warm',
      industry,
      designation,
      requirement: requirement || message || '',
      source: source || 'Web Form',
      status: 'New',
      leadId,
      companyId: new mongoose.Types.ObjectId(companyId),
      notes: message ? `Message from web form: ${message}` : 'Captured via Web Form',
      assignedTo: undefined // Set to undefined so it's "Unassigned" and visible to everyone to pick up
    });

    await lead.save();

    // AUTOMATION: Send Auto-Response to Lead (WhatsApp)
    if (phone) {
      const welcomeMsg = `Hello ${name}, thank you for contacting us! We have received your inquiry. Our team will get back to you shortly. Ref: ${leadId}`;
      sendWhatsAppMessage(phone, welcomeMsg).catch(e => console.error("Auto-WhatsApp failed:", e));
    }

    // AUTOMATION: Send Email Confirmation
    if (email) {
      sendLeadAutoResponseToLead(email, name).catch(e => console.error("Auto-Email failed:", e));
    }

    // AUTOMATION: Notify Admin via WhatsApp & Email
    if (adminUser) {
      if (adminUser.phone) {
        const notifyMsg = `🔔 New Lead Alert! ${name} has submitted a form on your website.`;
        sendWhatsAppMessage(adminUser.phone, notifyMsg).catch(e => console.error("Admin notification failed:", e));
      }
      if (adminUser.email) {
        sendLeadNotificationToAdmin(adminUser.email, { name, email, phone, company, requirement }).catch(e => console.error("Admin Email notification failed:", e));
      }
    }

    // Support for redirects if provided in query or body
    const redirectUrl = req.query.redirect || req.body.redirect;
    if (redirectUrl) {
      return res.redirect(redirectUrl);
    }

    res.status(201).json({
      message: "Lead captured successfully",
      leadId: lead.leadId
    });

  } catch (err) {
    console.error("CAPTURE LEAD ERROR:", err);
    res.status(500).json({
      message: "Error capturing lead",
      error: err.message
    });
  }
});

// =========================
// GET LEADS
// =========================
router.get('/', auth, async (req, res) => {
  try {
    const {
      status,
      assignedTo,
      source,
      priority,
      businessType,
      startDate,
      endDate,
      minBudget,
      maxBudget,
      followUpPending,
      converted
    } = req.query;

    // ROLE-BASED ACCESS CONTROL
    const role = req.user?.role;
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    console.log('GET LEADS DEBUG:', { userId, role, companyId });

    let query = {};

    if (role === 'super_admin') {
      console.log('Role is super_admin');
    } else {
      if (!companyId) {
        console.warn('GET LEADS: No companyId for user', userId);
        return res.status(403).json({ message: 'Unauthorized: No Company ID' });
      }
      query.companyId = new mongoose.Types.ObjectId(companyId);
    }

    console.log('FINAL LEADS QUERY:', JSON.stringify(query));

    // ============ FILTER SAFE MERGE ============
    if (status) query.status = status;

    // Only apply assignedTo filter if it doesn't conflict with existing constraints
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      const assignedToId = new mongoose.Types.ObjectId(assignedTo);
      if (query.$or) {
        // If we already have an $or (staff), we must ensure the requested assignedTo is the same as the user
        // OR we just append it to the query which will act as AND.
        // Actually, if a staff member filters by 'assignedTo', they can only filter for themselves.
        query.assignedTo = assignedToId;
      } else {
        query.assignedTo = assignedToId;
      }
    }

    if (source) query.source = new RegExp(source, 'i');
    if (priority) query.priority = priority;
    if (businessType) query.businessType = businessType;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    if (followUpPending === 'true') {
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      query.followUpDate = { $lte: today };
      query.status = { $nin: ['Converted', 'Closed', 'Lost'] };
    }

    if (converted === 'true') {
      query.status = 'Converted';
    } else if (converted === 'false') {
      query.status = { $ne: 'Converted' };
    }

    const leads = await Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(leads);

  } catch (err) {
    console.error("GET LEADS ERROR:", err);
    res.status(500).json({
      message: "Server Error",
      error: err.message
    });
  }
});


// =========================
// CREATE LEAD
// =========================
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user?.id;
    const companyId = req.user?.companyId;

    // SAFE LEAD ID GENERATION
    const lastLead = await Lead.findOne().sort({ createdAt: -1 });

    let nextNumber = 1;
    if (lastLead?.leadId) {
      const lastNumber = parseInt(lastLead.leadId.split('-')[1]);
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }

    const leadId = `LD-${String(nextNumber).padStart(5, '0')}`;

    const lead = new Lead({
      ...req.body,
      leadId,
      createdBy: new mongoose.Types.ObjectId(userId),
      createdByModel: req.user.type || 'User',
      assignedTo: req.body.assignedTo
        ? new mongoose.Types.ObjectId(req.body.assignedTo)
        : undefined,
      assignedToModel: req.body.assignedToModel || 'User',
      companyId: companyId ? new mongoose.Types.ObjectId(companyId) : undefined
    });

    await lead.save();

    const populated = await Lead.findById(lead._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    res.status(201).json(populated);

  } catch (err) {
    console.error("CREATE LEAD ERROR:", err);
    res.status(500).json({
      message: "Error saving lead",
      error: err.message
    });
  }
});


// =========================
// UPDATE LEAD
// =========================
router.put('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Lead ID" });
    }

    const role = req.user?.role;
    const companyId = req.user?.companyId;

    if (role !== 'super_admin') {
      const existingLead = await Lead.findById(req.params.id);
      if (!existingLead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      if (existingLead.companyId?.toString() !== companyId?.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    // prevent overwriting system fields
    const { leadId, createdBy, companyId: bodyCompanyId, ...safeUpdate } = req.body;

    const updated = await Lead.findByIdAndUpdate(
      req.params.id,
      safeUpdate,
      { new: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!updated) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json(updated);

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({
      message: "Error updating lead",
      error: err.message
    });
  }
});


// =========================
// DELETE LEAD
// =========================
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid Lead ID" });
    }

    const role = req.user?.role;
    const companyId = req.user?.companyId;

    const existingLead = await Lead.findById(req.params.id);
    if (!existingLead) {
      return res.status(404).json({ message: "Lead not found" });
    }
    if (role !== 'super_admin' && existingLead.companyId?.toString() !== companyId?.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deleted = await Lead.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Lead not found" });
    }

    res.json({ message: "Lead deleted successfully" });

  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({
      message: "Error deleting lead",
      error: err.message
    });
  }
});
router.get('/me', auth, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      id: user?.id,
      name: user?.name,
      email: user?.email,
      role: user?.role,
      companyId: user?.companyId
    });

  } catch (err) {
    res.status(500).json({ message: "Error getting user" });
  }
});
module.exports = router;