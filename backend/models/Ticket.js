const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  customerName: { type: String, required: true },
  email: { type: String, required: true },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  type: {
    type: String,
    enum: ['Technical', 'Sales', 'Billing', 'Support'],
    default: 'Support'
  },
  description: { type: String, required: true },
  attachmentUrl: String,
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel',
    required: true
  },
  createdByModel: {
    type: String,
    required: true,
    enum: ['User', 'StandardUser'],
    default: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'assignedToModel'
  },
  assignedToModel: {
    type: String,
    enum: ['User', 'StandardUser'],
    default: 'User'
  },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.models.Ticket || mongoose.model('Ticket', TicketSchema);
