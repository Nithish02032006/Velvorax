const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Invoice, Opportunity, Task, Lead, User, StandardUser } = require('../models');

// @route   GET api/reports/invoice
router.get('/invoice', auth, async (req, res) => {
  try {
    const { role, companyId } = req.user;
    let query = {};

    if (role !== 'super_admin') {
      if (!companyId) return res.status(403).json({ message: 'Unauthorized' });
      query.companyId = companyId;
    }

    const invoices = await Invoice.find(query);
    
    // Total Invoiced, Collected, Outstanding
    const totalInvoiced = invoices.reduce((acc, curr) => acc + curr.total, 0);
    const totalCollected = invoices.filter(i => i.status === 'Paid').reduce((acc, curr) => acc + curr.total, 0);
    const outstanding = totalInvoiced - totalCollected;

    // Aging (Simplified)
    const aging = {
      '1-30 Days': invoices.filter(i => i.status === 'Sent').reduce((acc, curr) => acc + curr.total, 0),
      '31-60 Days': 0,
      '61-90 Days': 0,
      '90+ Days': 0
    };

    // Revenue Over Time (Group by month)
    const revenueOverTime = {};
    invoices.forEach(i => {
      const month = new Date(i.createdAt).toLocaleString('default', { month: 'short' });
      revenueOverTime[month] = (revenueOverTime[month] || 0) + i.total;
    });

    res.json({
      totalInvoiced,
      totalCollected,
      outstanding,
      aging,
      revenueOverTime
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reports/tasks
// For business client: company tasks
// For super admin: all tasks
router.get('/tasks', auth, async (req, res) => {
  try {
    const { role, companyId, id } = req.user;
    let query = {};

    if (role !== 'super_admin') {
      if (!companyId) return res.status(403).json({ message: 'Unauthorized' });
      query.companyId = companyId;
    }

    const tasks = await Task.find(query)
      .populate('leadId', 'leadId name')
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .sort({ createdAt: -1 });

    // Summary statistics for the report
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Completed' || t.status === 'Done').length,
      pending: tasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length,
      highPriority: tasks.filter(t => t.priority === 'High' || t.priority === 'Urgent').length,
      myTasks: tasks.filter(t => t.assignedTo?._id?.toString() === id).length
    };

    res.json({
      stats,
      tasks
    });
  } catch (err) {
    console.error("TASK REPORT ERROR:", err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
