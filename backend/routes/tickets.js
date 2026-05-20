const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const { Ticket } = require('../models');

// @route   GET api/tickets
// @desc    Get all tickets for the current user
// @route   GET api/tickets
// @desc    Get all tickets
router.get('/', auth, async (req, res) => {
  try {
    const role = req.user?.role;
    const companyId = req.user?.companyId;
    const userId = req.user?.id;

    console.log('TICKETS GET HIT', { userId, role, companyId });

    const { status, priority, type } = req.query;

    let query = {};

    // ROLE-BASED ACCESS CONTROL
    if (role === 'super_admin') {
      // Sees all
    } else if (role === 'admin' || role === 'client') {
      if (!companyId) return res.status(403).json({ msg: 'Unauthorized: No company associated' });
      query.companyId = companyId;
    } else {
      // Staff/StandardUser sees only their own or assigned tickets
      if (!companyId) return res.status(403).json({ msg: 'Unauthorized: No company associated' });
      query.companyId = companyId;
      query.$or = [
        { assignedTo: userId },
        { createdBy: userId }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (type) {
      query.type = type;
    }

    const tickets = await Ticket.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(tickets || []);

  } catch (err) {
    console.error('TICKETS GET ERROR:', err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   GET api/tickets/:id
// @desc    Get a specific ticket
router.get('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    const isSuperAdmin = req.user.role === 'super_admin';
    const isCreator = ticket.createdBy._id.toString() === req.user.id;
    const isAssignee = ticket.assignedTo && ticket.assignedTo._id.toString() === req.user.id;
    const isSameCompany = ticket.companyId && ticket.companyId.toString() === req.user.companyId;

    // Check authorization - super admin, company users, creator or assignee can view
    if (!isSuperAdmin && !isSameCompany && !isCreator && !isAssignee) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    res.json(ticket);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   POST api/tickets
// @desc    Create a new ticket
router.post('/', auth, async (req, res) => {
  try {
    console.log('TICKETS POST HIT', req.user && { id: req.user.id, role: req.user.role, companyId: req.user.companyId });
    const { title, customerName, email, priority, type, description, attachmentUrl } = req.body;

    // Validate required fields
    if (!title || !customerName || !email || !description) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    // Generate ticket ID
    const ticketCount = await Ticket.countDocuments();
    const ticketId = `TK-${String(ticketCount + 1).padStart(6, '0')}`;

    const newTicket = new Ticket({
      ticketId,
      title,
      customerName,
      email,
      priority: priority || 'Medium',
      type: type || 'Support',
      description,
      attachmentUrl,
      status: 'Open',
      createdBy: req.user.id,
      createdByModel: req.user.type || 'User',
      assignedToModel: 'User',
      companyId: req.user.companyId
    });

    const ticket = await newTicket.save();

    res.json(ticket);
  } catch (err) {
    console.error(err.stack || err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   PUT api/tickets/:id
// @desc    Update a ticket
// @route   PUT api/tickets/:id
// @desc    Update a ticket
router.put('/:id', auth, async (req, res) => {

  try {

    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // ALLOW SUPER ADMIN
    const isSuperAdmin = req.user.role === 'super_admin';
    const isCreator = ticket.createdBy.toString() === req.user.id;
    const isAssignee = ticket.assignedTo && ticket.assignedTo.toString() === req.user.id;

    // If not creator, assignee, or super admin, deny all updates
    if (!isCreator && !isAssignee && !isSuperAdmin) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    const {
      title,
      customerName,
      email,
      priority,
      type,
      description,
      status,
      assignedTo,
      notes
    } = req.body;

    const isStatusOrNotesUpdateOnly =
      !(title || customerName || email || priority || type || description || assignedTo) &&
      (status || notes);

    if (!isCreator && !isSuperAdmin && !isStatusOrNotesUpdateOnly) {
      return res.status(403).json({ msg: 'Not authorized to edit ticket details' });
    }

    if (isCreator || isSuperAdmin) {
      if (title) ticket.title = title;
      if (customerName) ticket.customerName = customerName;
      if (email) ticket.email = email;
      if (priority) ticket.priority = priority;
      if (type) ticket.type = type;
      if (description) ticket.description = description;
      if (
        assignedTo &&
        mongoose.Types.ObjectId.isValid(assignedTo)
      ) {
        ticket.assignedTo = assignedTo;
      }
    }

    if (status) ticket.status = status;
    if (notes) ticket.notes = notes;

    ticket.updatedAt = Date.now();

    await ticket.save();

    res.json(ticket);

  } catch (err) {

    console.error(err.message);

    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    res.status(500).json({ msg: 'Server Error' });
  }
});

// @route   DELETE api/tickets/:id
// @desc    Delete a ticket
router.delete('/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ msg: 'Ticket not found' });
    }

    // Check authorization - only creator can delete
    if (ticket.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized' });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    res.json({ msg: 'Ticket deleted' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Ticket not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
