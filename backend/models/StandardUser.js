const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
   companyId: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'Company', // IMPORTANT
       required: true
   },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'staff' },
    status: {
        type: String,
        enum: ['pending', 'approved', 'active', 'rejected'],
        default: 'pending'
    },
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    activeToken: {
        type: String,
        default: null
    },
    createdAt: { type: Date, default: Date.now }
});

// Use existing model if it exists, otherwise define it
module.exports = mongoose.models.StandardUser || mongoose.model('StandardUser', UserSchema);