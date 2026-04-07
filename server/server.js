require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const connectDB = require('../database/connection');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Serve HTML pages
const pages = {
  '/': 'home.html',
  '/features': 'features.html',
  '/pricing': 'pricing.html',
  '/how-it-works': 'how-it-works.html',
  '/about': 'about.html',
  '/contact': 'contact.html',
  '/login': 'login.html',
  '/register': 'register.html',
  '/dashboard': 'dashboard.html',
  '/blog': 'blog.html',
  '/industries': 'industries.html'
};

Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) =>
    res.sendFile(path.join(__dirname, '../views', file))
  );
});

// Admin pages
const adminPages = {
  '/admin': 'admin-dashboard.html',
  '/admin/users': 'admin-users.html',
  '/admin/tenders': 'admin-tenders.html',
  '/admin/pricing': 'admin-pricing.html',
  '/admin/content': 'admin-content.html',
  '/admin/login': 'admin-login.html'
};

Object.entries(adminPages).forEach(([route, file]) => {
  app.get(route, (req, res) =>
    res.sendFile(path.join(__dirname, '../admin', file))
  );
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀 TendRAI Server running at http://localhost:${PORT}`);
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin/login`);
  console.log(`🌐 Website: http://localhost:${PORT}\n`);
});

module.exports = app;
