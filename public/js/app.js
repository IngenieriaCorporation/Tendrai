// TendRAI - Global Utilities

const API = {
  BASE: '/api',

  async request(endpoint, options = {}) {
    const token = localStorage.getItem('tendrai_token');
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
    const res = await fetch(this.BASE + endpoint, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },

  get: (ep) => API.request(ep),
  post: (ep, body) => API.request(ep, { method: 'POST', body: JSON.stringify(body) }),
  put: (ep, body) => API.request(ep, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (ep) => API.request(ep, { method: 'DELETE' }),

  async upload(endpoint, formData) {
    const token = localStorage.getItem('tendrai_token');
    const res = await fetch(this.BASE + endpoint, {
      method: 'POST', body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
  }
};

const Auth = {
  getUser() { try { return JSON.parse(localStorage.getItem('tendrai_user')); } catch { return null; } },
  getToken() { return localStorage.getItem('tendrai_token'); },
  isLoggedIn() { return !!this.getToken(); },
  logout() { localStorage.removeItem('tendrai_token'); localStorage.removeItem('tendrai_user'); window.location.href = '/login'; },
  requireAuth() { if (!this.isLoggedIn()) { window.location.href = '/login'; return false; } return true; }
};

const AdminAuth = {
  getAdmin() { try { return JSON.parse(localStorage.getItem('tendrai_admin')); } catch { return null; } },
  getToken() { return localStorage.getItem('tendrai_admin_token'); },
  isLoggedIn() { return !!this.getToken(); },
  logout() { localStorage.removeItem('tendrai_admin_token'); localStorage.removeItem('tendrai_admin'); window.location.href = '/admin/login'; },

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
    const res = await fetch('/api' + endpoint, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  },
  get: (ep) => AdminAuth.request(ep),
  post: (ep, body) => AdminAuth.request(ep, { method: 'POST', body: JSON.stringify(body) }),
  put: (ep, body) => AdminAuth.request(ep, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (ep) => AdminAuth.request(ep, { method: 'DELETE' })
};

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 4000);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

function daysUntil(dateStr) {
  const days = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  if (days < 0) return { text: 'Overdue', class: 'badge-danger' };
  if (days === 0) return { text: 'Today', class: 'badge-danger' };
  if (days <= 3) return { text: `${days}d left`, class: 'badge-danger' };
  if (days <= 7) return { text: `${days}d left`, class: 'badge-warning' };
  return { text: `${days}d left`, class: 'badge-success' };
}

function statusBadge(status) {
  const map = { 'draft': 'badge-secondary', 'in-progress': 'badge-accent', 'submitted': 'badge-warning', 'won': 'badge-success', 'lost': 'badge-danger', 'cancelled': 'badge-danger' };
  return `<span class="badge ${map[status] || 'badge-secondary'}">${status}</span>`;
}

// Scroll animations
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; } });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    el.style.opacity = '0'; el.style.transform = 'translateY(30px)'; el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
}

// Navbar scroll effect
function initNavbar() {
  const nav = document.querySelector('.navbar');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 50);
    });
  }
}

// Mobile menu
function initMobileMenu() {
  const toggle = document.getElementById('mobile-toggle');
  const menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('active'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollAnimations();
  initMobileMenu();
  // Remove loader if present
  const loader = document.getElementById('page-loader');
  if (loader) setTimeout(() => { loader.style.opacity = '0'; setTimeout(() => loader.remove(), 300); }, 500);
});
