// ============ USER MODEL ============
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  company: { type: String, default: '' },
  phone: { type: String, default: '' },
  subscription: { type: String, enum: ['free', 'starter', 'professional', 'enterprise'], default: 'free' },
  subscriptionExpiry: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
