const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: String,
  revenue: String,
  phone: String,
  website: String,
  country: String,
  employeesCount: String,

  servicesNeeded: [String],
  budgetRange: String,
  projectTimeline: String,
  referralSource: String,

  logo: String,

  subscriptionPlan: {
    type: String,
    enum: ['basic', 'growth', 'pro'],
    default: 'basic'
  },

  usersLimit: { type: Number, default: 5 },

  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },

  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Company', CompanySchema);