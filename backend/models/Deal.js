const mongoose = require('mongoose');

const DealSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account' }, // Changed from Company to Account to match your CRM flow

  name: String,
  amount: { type: Number, default: 0 },

  stage: {
    type: String,
    enum: ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'],
    default: 'Prospecting'
  },

  type: {
    type: String,
    enum: ['Existing Business', 'New Business'],
    default: 'New Business'
  },

  probability: { type: Number, default: 0 },
  closeDate: Date,
  source: String,

  region: {
    type: String,
    enum: ['North America', 'Europe', 'Asia Pacific', 'Latin America', 'Other'],
    default: 'Other'
  },

  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', index: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Deal', DealSchema);