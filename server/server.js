const express = require('express');
const path = require('path');

const app = express();

// Serve static files (IMPORTANT)
app.use(express.static(path.join(__dirname, '../public')));

// ------------------ USER PAGES ------------------
const pages = {
  '/login': 'login.html',
  '/register': 'register.html',
  '/dashboard': 'dashboard.html',
  '/blog': 'blog.html',
  '/industries': 'industries.html'
};

Object.entries(pages).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '../views', file));
  });
});

// ------------------ ADMIN PAGES ------------------
const adminPages = {
  '/admin': 'admin-dashboard.html',
  '/admin/users': 'admin-users.html',
  '/admin/tenders': 'admin-tenders.html',
  '/admin/pricing': 'admin-pricing.html',
  '/admin/content': 'admin-content.html',
  '/admin/login': 'admin-login.html'
};

Object.entries(adminPages).forEach(([route, file]) => {
  app.get(route, (req, res) => {
    res.sendFile(path.join(__dirname, '../admin', file));
  });
});

// ------------------ ROOT ROUTE (IMPORTANT) ------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'index.html'));
});

// ------------------ ERROR HANDLER ------------------
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});

// ------------------ PORT FIX (RENDER CRITICAL) ------------------
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 TendRAI Server running`);
  console.log(`🌐 Live URL: https://tendrai-wk0c.onrender.com`);
});

module.exports = app;
  console.log(`🌐 Website: http://localhost:${PORT}\n`);
});

module.exports = app;
