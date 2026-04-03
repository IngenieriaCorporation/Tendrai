const mongoose = require('mongoose');

const TenderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  tenderNumber: { type: String, default: '' },
  organization: { type: String, default: '' },
  portal: { type: String, default: '' },
  category: { type: String, enum: ['construction', 'it', 'supplies', 'services', 'consulting', 'other'], default: 'other' },
  value: { type: Number, default: 0 },
  submissionDeadline: { type: Date, required: true },
  openingDate: { type: Date },
  status: { type: String, enum: ['draft', 'in-progress', 'submitted', 'won', 'lost', 'cancelled'], default: 'draft' },
  documents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  aiAnalysis: {
    score: { type: Number, default: 0 },
    summary: { type: String, default: '' },
    requirements: [String],
    compliance: [{ item: String, status: String }],
    analyzedAt: { type: Date }
  },
  notes: { type: String, default: '' },
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tender', TenderSchema);
