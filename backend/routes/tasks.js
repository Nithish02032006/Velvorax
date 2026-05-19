const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Task, User, Lead, StandardUser } = require('../models');

// ================= USERS LIST =================
router.get('/users/list', auth, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const isSuperAdmin = req.user.role === 'super_admin';

    const users = isSuperAdmin
      ? await User.find({}, 'name email role')
      : await User.find({ companyId }, 'name email role');

    const standardUsers = isSuperAdmin
      ? await StandardUser.find({}, 'name email role')
      : await StandardUser.find({ companyId }, 'name email role');

    const combined = [
      ...users.map(u => ({ _id: u._id, name: u.name, role: u.role, type: 'User' })),
      ...standardUsers.map(u => ({ _id: u._id, name: u.name, role: u.role, type: 'StandardUser' }))
    ];
    res.json(combined);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ================= LEADS LIST =================
router.get('/leads/list', auth, async (req, res) => {
  try {
    const companyId = req.user.companyId;
    const isSuperAdmin = req.user.role === 'super_admin';

    const leads = isSuperAdmin
      ? await Lead.find({}, 'leadId name').sort({ createdAt: -1 })
      : await Lead.find({ companyId }, 'leadId name').sort({ createdAt: -1 });

    res.json(leads);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ================= GET TASKS =================
router.get('/', auth, async (req, res) => {
  try {
    const query = req.user.role === 'super_admin'
      ? {}
      : { companyId: req.user.companyId };

    const tasks = await Task.find(query)
      .populate('leadId', 'leadId name')
      .populate({
        path: 'assignedTo',
        select: 'name email role'
      })
      .populate('assignedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error('Population Error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

// ================= CREATE TASK =================
router.post('/', auth, async (req, res) => {
  try {
    const { title, leadId, relatedTo, dueDate, priority, status, assignedTo, assignedToModel } = req.body;

    const newTask = new Task({
      title,
      leadId: leadId || null,
      relatedTo: relatedTo || '',
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'Medium',
      status: status || 'Pending',
      companyId: req.user.companyId,
      assignedBy: req.user.id,
      assignedTo: assignedTo || null,
      assignedToModel: assignedToModel || 'User'
    });

    const savedTask = await newTask.save();

    // Immediately populate and return so UI shows the name
    const populated = await Task.findById(savedTask._id)
      .populate('leadId', 'leadId name')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');

    res.json(populated);
  } catch (err) {
    console.error('Task Creation Error:', err);
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })
      .populate('leadId', 'leadId name')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');
    res.json(task);
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Server Error' });
  }
});

module.exports = router;
