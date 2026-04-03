const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tender' },
  originalName: { type: String, required: true },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  mimetype: { type: String },
  size: { type: Number },
  type: { type: String, enum: ['tender-notice', 'bid-document', 'compliance', 'certificate', 'other'], default: 'other' },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', DocumentSchema);
