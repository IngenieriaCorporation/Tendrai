const express = require('express');
const router = express.Router();
const { adminMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Tender = require('../models/Tender');
const PricingPlan = require('../models/PricingPlan');
const WebsiteContent = require('../models/WebsiteContent');
const Admin = require('../models/Admin');

// GET /api/admin/dashboard
router.get('/dashboard', adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalTenders = await Tender.countDocuments();
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('-password');
    const recentTenders = await Tender.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'name email');
    const subStats = await User.aggregate([{ $group: { _id: '$subscription', count: { $sum: 1 } } }]);

    res.json({ stats: { totalUsers, activeUsers, totalTenders }, recentUsers, recentTenders, subscriptionStats: subStats });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/admin/users
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const { search, subscription, page = 1, limit = 20 } = req.query;
    const query = {};
    if (search) query.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (subscription) query.subscription = subscription;

    const total = await User.countDocuments(query);
    const users = await User.find(query).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', adminMiddleware, async (req, res) => {
  try {
    const { isActive, subscription, subscriptionExpiry } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive, subscription, subscriptionExpiry }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/tenders
router.get('/tenders', adminMiddleware, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Tender.countDocuments(query);
    const tenders = await Tender.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).populate('userId', 'name email');
    res.json({ tenders, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/admin/tenders/:id
router.delete('/tenders/:id', adminMiddleware, async (req, res) => {
  try {
    await Tender.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tender deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/pricing
router.get('/pricing', async (req, res) => {
  try {
    const plans = await PricingPlan.find().sort({ order: 1 });
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/pricing
router.post('/pricing', adminMiddleware, async (req, res) => {
  try {
    const { planId, name, price, features, highlighted, isCustom } = req.body;
    let plan;
    if (planId) {
      plan = await PricingPlan.findByIdAndUpdate(planId, { name, price, features, highlighted, isCustom, updatedAt: new Date() }, { new: true });
    } else {
      plan = await PricingPlan.create({ name, price, features, highlighted, isCustom });
    }
    res.json({ message: 'Pricing updated', plan });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/content
router.get('/content', async (req, res) => {
  try {
    const content = await WebsiteContent.findOne();
    res.json({ content });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/admin/content-update
router.post('/content-update', adminMiddleware, async (req, res) => {
  try {
    const content = await WebsiteContent.findOneAndUpdate({}, { ...req.body, updatedAt: new Date() }, { new: true, upsert: true });
    res.json({ message: 'Content updated successfully', content });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/admin/blog
router.post('/blog', adminMiddleware, async (req, res) => {
  try {
    const { title, excerpt, content, category } = req.body;
    const slug = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    await WebsiteContent.findOneAndUpdate({}, { $push: { blogPosts: { title, slug, excerpt, content, category } } });
    res.json({ message: 'Blog post added' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
