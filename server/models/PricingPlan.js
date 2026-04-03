const mongoose = require('mongoose');
const PricingPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: '₹' },
  period: { type: String, default: 'month' },
  features: [String],
  highlighted: { type: Boolean, default: false },
  isCustom: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('PricingPlan', PricingPlanSchema);
