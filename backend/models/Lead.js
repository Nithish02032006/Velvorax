const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  leadId: String,

  name: { type: String, required: true },
  company: String,
  email: String,
  phone: String,
  whatsapp: String,
  address: String,
  industry: String,
  businessType: String,
  designation: String,
  requirement: String,

  budget: { type: Number, default: 0 },

  priority: {
    type: String,
    enum: ['Hot', 'Warm', 'Cold'],
    default: 'Warm'
  },

  status: {
    type: String,
    enum: ['New', 'Assigned', 'In Process', 'Converted', 'Recycled', 'Closed', 'Lost'],
    default: 'New'
  },

  source: String,
  followUpDate: Date,
  notes: String,

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

  lastActivity: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Lead', LeadSchema);