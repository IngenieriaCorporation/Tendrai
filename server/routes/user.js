const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware } = require('../middleware/auth');
const User = require('../models/User');
const Tender = require('../models/Tender');
const Document = require('../models/Document');

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `public/uploads/${req.user.id}`;
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.xls', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOCX, DOC, XLS, XLSX files are allowed'));
  }
});

// GET /api/dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    const totalTenders = await Tender.countDocuments({ userId });
    const activeTenders = await Tender.countDocuments({ userId, status: { $in: ['draft', 'in-progress'] } });
    const wonTenders = await Tender.countDocuments({ userId, status: 'won' });
    const submittedTenders = await Tender.countDocuments({ userId, status: 'submitted' });

    const upcoming = await Tender.find({ userId, submissionDeadline: { $gte: new Date() }, status: { $nin: ['won', 'lost', 'cancelled'] } })
      .sort({ submissionDeadline: 1 }).limit(5);

    const recentTenders = await Tender.find({ userId }).sort({ createdAt: -1 }).limit(5);

    res.json({ user, stats: { totalTenders, activeTenders, wonTenders, submittedTenders }, upcomingDeadlines: upcoming, recentTenders });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/tenders
router.get('/tenders', authMiddleware, async (req, res) => {
  try {
    const { status, search, category, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user.id };
    if (status) query.status = status;
    if (category) query.category = category;
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { tenderNumber: { $regex: search, $options: 'i' } }, { organization: { $regex: search, $options: 'i' } }];

    const total = await Tender.countDocuments(query);
    const tenders = await Tender.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)).populate('documents');

    res.json({ tenders, total, pages: Math.ceil(total / limit), current: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/create-tender
router.post('/create-tender', authMiddleware, async (req, res) => {
  try {
    const { title, tenderNumber, organization, portal, category, value, submissionDeadline, openingDate, notes, tags } = req.body;
    if (!title || !submissionDeadline) return res.status(400).json({ message: 'Title and deadline are required' });

    const tender = await Tender.create({
      userId: req.user.id, title, tenderNumber, organization, portal, category, value,
      submissionDeadline, openingDate, notes, tags: tags ? tags.split(',').map(t => t.trim()) : []
    });
    res.status(201).json({ message: 'Tender created successfully', tender });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/tenders/:id
router.put('/tenders/:id', authMiddleware, async (req, res) => {
  try {
    const tender = await Tender.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { ...req.body, updatedAt: new Date() }, { new: true });
    if (!tender) return res.status(404).json({ message: 'Tender not found' });
    res.json({ message: 'Tender updated', tender });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/tenders/:id
router.delete('/tenders/:id', authMiddleware, async (req, res) => {
  try {
    const tender = await Tender.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!tender) return res.status(404).json({ message: 'Tender not found' });
    res.json({ message: 'Tender deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/upload
router.post('/upload', authMiddleware, upload.array('documents', 20), async (req, res) => {
  try {
    const { tenderId, documentType } = req.body;

    // Check document count per tender
    if (tenderId) {
      const existingCount = await Document.countDocuments({ tenderId });
      if (existingCount + req.files.length > 20) {
        return res.status(400).json({ message: 'Maximum 20 documents per tender allowed' });
      }
    }

    const docs = await Promise.all(req.files.map(file =>
      Document.create({
        userId: req.user.id, tenderId: tenderId || null, originalName: file.originalname,
        filename: file.filename, path: file.path, mimetype: file.mimetype, size: file.size, type: documentType || 'other'
      })
    ));

    if (tenderId) {
      await Tender.findByIdAndUpdate(tenderId, { $push: { documents: { $each: docs.map(d => d._id) } } });
    }

    res.json({ message: `${docs.length} document(s) uploaded successfully`, documents: docs });
  } catch (err) {
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
});

// GET /api/documents/:tenderId
router.get('/documents/:tenderId', authMiddleware, async (req, res) => {
  try {
    const docs = await Document.find({ tenderId: req.params.tenderId, userId: req.user.id });
    res.json({ documents: docs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/ai-analyze/:tenderId (simulated AI analysis)
router.post('/ai-analyze/:tenderId', authMiddleware, async (req, res) => {
  try {
    const tender = await Tender.findOne({ _id: req.params.tenderId, userId: req.user.id });
    if (!tender) return res.status(404).json({ message: 'Tender not found' });

    // Simulated AI analysis
    const analysis = {
      score: Math.floor(Math.random() * 30) + 70,
      summary: `AI analysis complete for "${tender.title}". This tender requires attention to technical specifications and financial documentation.`,
      requirements: ['Company Registration Certificate', 'GST Registration', 'EMD/Bid Security', 'Technical Bid Documents', 'Financial Bid', 'Bank Solvency Certificate'],
      compliance: [
        { item: 'Company Registration', status: 'required' }, { item: 'GST Certificate', status: 'required' },
        { item: 'ISO Certification', status: 'preferred' }, { item: 'Past Experience', status: 'required' },
        { item: 'Financial Turnover', status: 'required' }
      ],
      analyzedAt: new Date()
    };

    await Tender.findByIdAndUpdate(req.params.tenderId, { aiAnalysis: analysis });
    res.json({ message: 'AI analysis complete', analysis });
  } catch (err) {
    res.status(500).json({ message: 'Analysis failed', error: err.message });
  }
});

// GET /api/profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, company, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, company, phone }, { new: true }).select('-password');
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
