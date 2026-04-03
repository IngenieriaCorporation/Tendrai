const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await seedInitialData();
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

async function seedInitialData() {
  const WebsiteContent = require('../server/models/WebsiteContent');
  const PricingPlan = require('../server/models/PricingPlan');
  const Admin = require('../server/models/Admin');
  const bcrypt = require('bcryptjs');

  // Seed website content
  const contentCount = await WebsiteContent.countDocuments();
  if (contentCount === 0) {
    await WebsiteContent.create({
      heroHeadline: 'Win More Government Tenders with AI',
      heroSubtext: 'Upload documents, track deadlines, and manage bids faster with TendRAI automation.',
      tagline: 'AI Powered Tender Filing & Bid Management Platform',
      contactEmail: 'hello@tendrai.in',
      contactPhone: '+91 98765 43210',
      contactAddress: 'Mumbai, Maharashtra, India',
      socialLinks: {
        twitter: 'https://twitter.com/tendrai',
        linkedin: 'https://linkedin.com/company/tendrai',
        youtube: 'https://youtube.com/@tendrai'
      },
      faqs: [
        { question: 'What is TendRAI?', answer: 'TendRAI is an AI-powered platform that helps contractors and MSMEs win government tenders by automating document preparation and bid management.' },
        { question: 'How does AI document analysis work?', answer: 'Our AI scans tender documents, extracts key requirements, identifies compliance needs, and suggests bid strategies based on historical win data.' },
        { question: 'Can I manage multiple tenders?', answer: 'Yes! All plans support multiple tender tracking. Professional and Enterprise plans offer unlimited tenders.' },
        { question: 'Is my data secure?', answer: 'Absolutely. We use bank-grade encryption for all documents. Your data is stored on secure Indian servers compliant with IT Act 2000.' },
        { question: 'Do you support all government portals?', answer: 'We support GeM, CPPP, NSWS, state-level portals, and 50+ government procurement platforms.' }
      ],
      testimonials: [
        { name: 'Rajesh Kumar', company: 'RK Constructions', text: 'TendRAI helped us win 3 NHAI tenders in one quarter. The AI analysis is incredibly accurate.', rating: 5 },
        { name: 'Priya Sharma', company: 'TechBuild Solutions', text: 'Deadline tracking alone saved us from missing ₹2.5 Cr opportunities. Worth every rupee.', rating: 5 },
        { name: 'Amit Patel', company: 'Patel Infra Ltd', text: 'The compliance checker caught errors we would have missed. Our bid success rate doubled.', rating: 5 }
      ]
    });
    console.log('✅ Website content seeded');
  }

  // Seed pricing plans
  const planCount = await PricingPlan.countDocuments();
  if (planCount === 0) {
    await PricingPlan.insertMany([
      { name: 'Starter', price: 999, currency: '₹', period: 'month', features: ['5 Active Tenders', 'AI Document Analysis', 'Deadline Tracker', '10 GB Storage', 'Email Support'], highlighted: false, order: 1 },
      { name: 'Professional', price: 2999, currency: '₹', period: 'month', features: ['Unlimited Tenders', 'Advanced AI Analysis', 'Compliance Checker', '100 GB Storage', 'Team (5 members)', 'Priority Support', 'API Access'], highlighted: true, order: 2 },
      { name: 'Enterprise', price: 0, currency: '₹', period: 'month', features: ['Unlimited Everything', 'Custom AI Training', 'Dedicated Manager', 'Unlimited Storage', 'Unlimited Team', '24/7 Phone Support', 'Custom Integration'], highlighted: false, order: 3, isCustom: true }
    ]);
    console.log('✅ Pricing plans seeded');
  }

  // Seed admin account
  const adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    const hashedPassword = await bcrypt.hash('admin@tendrai2024', 10);
    await Admin.create({ email: 'admin@tendrai.in', password: hashedPassword, name: 'Super Admin', role: 'superadmin' });
    console.log('✅ Admin account seeded: admin@tendrai.in / admin@tendrai2024');
  }
}

module.exports = connectDB;
