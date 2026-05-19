const mongoose = require('mongoose');

const AccountSchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String },
  website: { type: String },
  country: { type: String },
  revenue: { type: String },
  projectTimeline: { type: String },

  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Account', AccountSchema);