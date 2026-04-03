# TendRAI — AI Powered Tender Filing & Bid Management Platform

> Complete production-ready SaaS platform for Indian government tender management.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ — [Download](https://nodejs.org)
- **MongoDB** v6+ — [Download](https://mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/atlas)
- **VS Code** — [Download](https://code.visualstudio.com)

### Installation

```bash
# 1. Clone / download this project
cd tendrai

# 2. Install dependencies
npm install

# 3. Configure environment
# Edit .env file with your MongoDB connection:
# MONGODB_URI=mongodb://localhost:27017/tendrai
# (or your MongoDB Atlas connection string)

# 4. Start the server
npm run dev       # Development (auto-restart)
npm start         # Production
```

### 5. Access the Application

| URL | Description |
|-----|-------------|
| `http://localhost:3000` | Public Website |
| `http://localhost:3000/register` | User Registration |
| `http://localhost:3000/dashboard` | User Dashboard |
| `http://localhost:3000/admin/login` | Admin Login |
| `http://localhost:3000/admin` | Admin Dashboard |

### Default Admin Credentials
```
Email:    admin@tendrai.in
Password: admin@tendrai2024
```
> ⚠️ Change these immediately in production!

---

## 📁 Folder Structure

```
tendrai/
├── .env                    # Environment variables
├── package.json
├── database/
│   └── connection.js       # MongoDB connection + seed data
├── server/
│   ├── server.js           # Express app entry point
│   ├── middleware/
│   │   └── auth.js         # JWT auth middleware
│   ├── models/
│   │   ├── User.js
│   │   ├── Tender.js
│   │   ├── Document.js
│   │   ├── PricingPlan.js
│   │   ├── WebsiteContent.js
│   │   └── Admin.js
│   └── routes/
│       ├── auth.js         # Login / Register APIs
│       ├── user.js         # User dashboard APIs
│       └── admin.js        # Admin panel APIs
├── public/
│   ├── css/
│   │   ├── style.css       # Global styles
│   │   └── admin.css       # Admin panel styles
│   ├── js/
│   │   └── app.js          # Shared JS utilities
│   └── uploads/            # Uploaded documents (auto-created)
├── views/                  # Public website pages
│   ├── home.html
│   ├── features.html
│   ├── pricing.html
│   ├── how-it-works.html
│   ├── about.html
│   ├── contact.html
│   ├── blog.html
│   ├── industries.html
│   ├── login.html
│   ├── register.html
│   └── dashboard.html
└── admin/                  # Admin panel pages
    ├── admin-login.html
    ├── admin-dashboard.html
    ├── admin-users.html
    ├── admin-tenders.html
    ├── admin-pricing.html
    └── admin-content.html
```

---

## 🔌 API Reference

### Auth APIs
```
POST /api/register          Register new user
POST /api/login             User login
POST /api/admin/login       Admin login
```

### User APIs (requires JWT token)
```
GET  /api/dashboard         Dashboard stats + recent tenders
GET  /api/tenders           List tenders (with search/filter/pagination)
POST /api/create-tender     Create new tender
PUT  /api/tenders/:id       Update tender
DELETE /api/tenders/:id     Delete tender
POST /api/upload            Upload documents (multipart/form-data)
GET  /api/documents/:tid    Get documents for a tender
POST /api/ai-analyze/:tid   Run AI analysis on tender
GET  /api/profile           Get user profile
PUT  /api/profile           Update user profile
```

### Admin APIs (requires Admin JWT token)
```
GET  /api/admin/dashboard       Admin stats
GET  /api/admin/users           List all users
PUT  /api/admin/users/:id       Update user (plan, status)
DELETE /api/admin/users/:id     Delete user
GET  /api/admin/tenders         List all tenders
DELETE /api/admin/tenders/:id   Delete tender
GET  /api/admin/pricing         Get pricing plans (public)
POST /api/admin/pricing         Create/update pricing plan
GET  /api/admin/content         Get website content (public)
POST /api/admin/content-update  Update website content
POST /api/admin/blog            Add blog post
```

---

## 🛠 Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, TailwindCSS-inspired CSS, Vanilla JS |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| File Uploads | Multer |
| Fonts | Google Fonts (Syne + DM Sans) |

---

## ⚙️ Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tendrai
JWT_SECRET=your-very-secret-key-here
ADMIN_SECRET=admin-secret-here
NODE_ENV=development
```

---

## 🚀 Deployment

### Deploy to Render.com (Recommended - Free)
1. Push code to GitHub
2. Connect repo to [render.com](https://render.com)
3. Set environment variables in Render dashboard
4. Use MongoDB Atlas for production database

### Deploy to Railway.app
1. Install Railway CLI: `npm i -g @railway/cli`
2. `railway login` → `railway init` → `railway up`

### Deploy to VPS (DigitalOcean/AWS)
```bash
# On your server:
git clone <your-repo>
cd tendrai
npm install --production
npm install -g pm2
pm2 start server/server.js --name tendrai
pm2 startup && pm2 save
```

---

## 🔒 Security Checklist for Production

- [ ] Change `JWT_SECRET` to a long random string
- [ ] Change admin password immediately
- [ ] Set `NODE_ENV=production`
- [ ] Use HTTPS with SSL certificate
- [ ] Set up MongoDB authentication
- [ ] Configure rate limiting
- [ ] Add helmet.js for HTTP security headers
- [ ] Move file uploads to cloud storage (AWS S3 / Cloudinary)

---

## 📊 Database Collections

| Collection | Description |
|-----------|-------------|
| `users` | Registered contractors and businesses |
| `tenders` | Tender bids and management |
| `documents` | Uploaded tender documents |
| `pricingplans` | Subscription pricing (editable by admin) |
| `websitecontents` | All website content (editable by admin) |
| `admins` | Admin user accounts |

---

## 🎨 Branding

- **Primary Color**: `#0F172A` (Deep Blue)
- **Accent Color**: `#22D3EE` (Electric Cyan)
- **Secondary Color**: `#6366F1` (Indigo)
- **Fonts**: Syne (headings) + DM Sans (body)

---

Made with ❤️ for India's contractors and MSMEs.
