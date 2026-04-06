const express = require('express');
const path = require('path');

const app = express();

// ================= IMPORT ROUTES =================
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, '../public')));

// ================= API ROUTES =================
app.use('/api', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api/admin', adminRoutes);

// ================= USER PAGES =================
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

// ================= ADMIN PAGES =================
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

// ================= ROOT =================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../views', 'home.html'));
});

// ================= HEALTH =================
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// ================= ERROR HANDLER =================
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: err.message
  });
});

// ================= 404 =================
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

// ================= SERVER START =================
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 TendRAI Server running on port ${PORT}`);
});

module.exports = app;
