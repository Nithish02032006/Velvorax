const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Lead, Deal, Invoice, Company, User, Task } = require('../models');

// @route   GET api/dashboard/stats
// @desc    Get comprehensive dashboard statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // 1. Core KPIs
    const totalLeads = await Lead.countDocuments();
    const totalDeals = await Deal.countDocuments();
    const wonDeals = await Deal.find({ stage: 'Closed Won' });
    const lostDeals = await Deal.find({ stage: 'Closed Lost' });
    const activeDeals = await Deal.countDocuments({ stage: { $nin: ['Closed Won', 'Closed Lost'] } });
    
    const totalRevenue = wonDeals.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const dealsClosed = wonDeals.length + lostDeals.length;
    const conversionRate = totalDeals > 0 ? ((wonDeals.length / totalDeals) * 100).toFixed(1) : 0;
    const winRate = dealsClosed > 0 ? ((wonDeals.length / dealsClosed) * 100).toFixed(1) : 0;

    // 2. Lead Distribution (Status & Source)
    const leadStatuses = await Lead.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const statusMap = { 'Closed': 0, 'Assigned': 0, 'Converted': 0, 'In Process': 0, 'New': 0 };
    leadStatuses.forEach(s => statusMap[s._id] = s.count);

    const sources = await Lead.aggregate([
      { $group: { _id: "$source", count: { $sum: 1 } } }
    ]);
    const sourceStats = { 'Email': 0, 'Call': 0, 'Existing Customer': 0, 'Other': 0 };
    sources.forEach(s => sourceStats[s._id || 'Other'] = s.count);

    // 3. Sales by Region
    const regions = await Deal.aggregate([
      { $group: { _id: "$region", revenue: { $sum: "$amount" }, count: { $sum: 1 } } }
    ]);
    const regionStats = { 'North America': 0, 'Europe': 0, 'Asia Pacific': 0, 'Latin America': 0 };
    regions.forEach(r => { if(r._id) regionStats[r._id] = r.revenue; });

    // 4. Deal Pipeline Stages
    const pipelineStages = await Deal.aggregate([
      { $group: { _id: "$stage", count: { $sum: 1 }, amount: { $sum: "$amount" } } }
    ]);
    const pipelineMap = { 'Qualified': 0, 'Demo': 0, 'Proposal': 0, 'Negotiation': 0, 'Closed Won': 0 };
    pipelineStages.forEach(p => pipelineMap[p._id] = p.amount);

    // 5. Monthly Revenue vs Target (Mocking target for now, or use a setting)
    const monthlyRevenue = await Deal.aggregate([
      { $match: { stage: 'Closed Won' } },
      { $group: { 
        _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } }, 
        revenue: { $sum: "$amount" } 
      } },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 6. Top Performers
    const performers = await Deal.aggregate([
      { $match: { stage: 'Closed Won' } },
      { $group: { _id: "$assignedTo", totalRevenue: { $sum: "$amount" }, deals: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ["$user.name", "Unknown"] }, totalRevenue: 1, deals: 1 } },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // 7. Sales Metrics
    const avgDealSize = wonDeals.length > 0 ? (totalRevenue / wonDeals.length).toFixed(0) : 0;
    
    // Sales Cycle Calculation (avg time from createdAt to Won)
    let totalCycleTime = 0;
    wonDeals.forEach(d => {
      const diff = new Date(d.updatedAt || d.createdAt) - new Date(d.createdAt);
      totalCycleTime += diff;
    });
    const avgSalesCycle = wonDeals.length > 0 ? (totalCycleTime / (wonDeals.length * 1000 * 60 * 60 * 24)).toFixed(0) : 0;

    // 8. Forecast (Negotiation and Proposal stages)
    const forecast = await Deal.aggregate([
      { $match: { stage: { $in: ['Negotiation', 'Proposal'] } } },
      { $group: { _id: "$stage", amount: { $sum: "$amount" } } }
    ]);

    // 9. Recent Opportunities for the widget
    const opportunities = await Deal.find({ stage: { $nin: ['Closed Won', 'Closed Lost'] } })
      .limit(5)
      .sort({ createdAt: -1 });

    // 10. Tasks
    const { Task } = require('../models');
    const tasks = {
      total: await Task.countDocuments(),
      overdue: await Task.countDocuments({ status: 'Pending', dueDate: { $lt: new Date() } }),
      today: await Task.countDocuments({ 
        status: 'Pending', 
        dueDate: { 
          $gte: new Date().setHours(0,0,0,0), 
          $lt: new Date().setHours(23,59,59,999) 
        } 
      }),
      list: await Task.find({ status: 'Pending' }).limit(5).sort({ dueDate: 1 })
    };

    res.json({
      totalLeads,
      totalRevenue,
      dealsClosed,
      conversionRate,
      winRate,
      activeDeals,
      statusMap,
      sourceStats,
      regionStats,
      pipelineMap,
      monthlyRevenue,
      performers,
      avgDealSize,
      avgSalesCycle,
      opportunities,
      tasks
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/dashboard/registrations
// @desc    Get all registered users and their companies
router.get('/registrations', auth, async (req, res) => {
  try {
    const registrations = await User.find().populate('companyId').sort({ createdAt: -1 });
    res.json(registrations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/dashboard/registrations/:companyId/approve
// @desc    Approve a company registration
router.put('/registrations/:companyId/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    const company = await Company.findByIdAndUpdate(req.params.companyId, { approvalStatus: 'Approved' }, { new: true });
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/dashboard/registrations/:companyId/reject
// @desc    Reject a company registration
router.put('/registrations/:companyId/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    const company = await Company.findByIdAndUpdate(req.params.companyId, { approvalStatus: 'Rejected' }, { new: true });
    res.json(company);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/dashboard/registrations/:companyId
// @desc    Remove a company registration
router.delete('/registrations/:companyId', auth, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ msg: 'Unauthorized' });
    }
    await Company.findByIdAndDelete(req.params.companyId);
    // Optionally delete users associated with this company
    await User.deleteMany({ companyId: req.params.companyId });
    res.json({ msg: 'Company and associated users removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/dashboard/client-stats
// @desc    Get dashboard stats scoped to the client's company
router.get('/client-stats', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).populate('companyId');
    if (!user || !user.companyId) return res.status(400).json({ msg: 'No company found' });
    const companyId = user.companyId._id;

    const totalLeads = await Lead.countDocuments({ company: user.companyId.name });
    const totalDeals = await Deal.countDocuments({ accountId: companyId });
    const wonDeals = await Deal.find({ accountId: companyId, stage: 'Closed Won' });
    const lostDeals = await Deal.find({ accountId: companyId, stage: 'Closed Lost' });
    const activeDeals = await Deal.countDocuments({ accountId: companyId, stage: { $nin: ['Closed Won', 'Closed Lost'] } });
    const totalRevenue = wonDeals.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const dealsClosed = wonDeals.length + lostDeals.length;
    const conversionRate = totalDeals > 0 ? ((wonDeals.length / totalDeals) * 100).toFixed(1) : 0;
    const winRate = dealsClosed > 0 ? ((wonDeals.length / dealsClosed) * 100).toFixed(1) : 0;

    // Lead Status
    const allLeads = await Lead.find({ company: user.companyId.name });
    const statusMap = { 'Closed': 0, 'Assigned': 0, 'Converted': 0, 'In Process': 0, 'New': 0 };
    allLeads.forEach(l => { if (statusMap[l.status] !== undefined) statusMap[l.status]++; });
    const sourceStats = { 'Email': 0, 'Call': 0, 'Existing Customer': 0, 'Other': 0 };
    allLeads.forEach(l => { const s = l.source || 'Other'; if (sourceStats[s] !== undefined) sourceStats[s]++; else sourceStats['Other']++; });

    // Team members
    const teamMembers = await User.find({ companyId }).select('name email role createdAt');

    // Tasks
    const tasks = {
      total: await Task.countDocuments(),
      list: await Task.find({ status: 'Pending' }).limit(5).sort({ dueDate: 1 })
    };

    // Opportunities
    const opportunities = await Deal.find({ accountId: companyId, stage: { $nin: ['Closed Won', 'Closed Lost'] } }).limit(5).sort({ createdAt: -1 });

    res.json({
      company: user.companyId,
      totalLeads: allLeads.length,
      totalRevenue,
      dealsClosed,
      conversionRate,
      winRate,
      activeDeals,
      statusMap,
      sourceStats,
      tasks,
      opportunities,
      teamMembers
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
