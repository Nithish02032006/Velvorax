const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    companyName: { type: String, required: true },
    website: { type: String },
    programType: {
        type: String,
        enum: ['Referral', 'Agency', 'Technology'],
        required: true
    },
    message: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Reviewed', 'Accepted', 'Rejected'],
        default: 'Pending'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Partner', PartnerSchema);
