const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },

  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: {
    type: String,
    enum: ['super_admin', 'client', 'admin', 'staff'],
    default: 'staff'
  },
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  activeToken: {
    type: String,
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);