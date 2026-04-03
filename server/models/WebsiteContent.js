const mongoose = require('mongoose');

const WebsiteContentSchema = new mongoose.Schema({
  heroHeadline: { type: String, default: 'Win More Government Tenders with AI' },
  heroSubtext: { type: String, default: 'Upload documents, track deadlines, and manage bids faster with TendRAI automation.' },
  tagline: { type: String, default: 'AI Powered Tender Filing & Bid Management Platform' },
  logoUrl: { type: String, default: '' },
  contactEmail: { type: String, default: 'hello@tendrai.in' },
  contactPhone: { type: String, default: '+91 98765 43210' },
  contactAddress: { type: String, default: 'Mumbai, Maharashtra, India' },
  socialLinks: { twitter: { type: String, default: '' }, linkedin: { type: String, default: '' }, youtube: { type: String, default: '' } },
  faqs: [{ question: String, answer: String, _id: false }],
  testimonials: [{ name: String, company: String, text: String, rating: Number, _id: false }],
  blogPosts: [{ title: String, slug: String, excerpt: String, content: String, category: String, publishedAt: { type: Date, default: Date.now } }],
  updatedAt: { type: Date, default: Date.now }
});

const WebsiteContent = mongoose.model('WebsiteContent', WebsiteContentSchema);
module.exports = WebsiteContent;
module.exports.WebsiteContent = WebsiteContent;
