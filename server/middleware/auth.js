const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.adminToken;
  if (!token) return res.status(401).json({ message: 'Admin access required' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid admin token' });
  }
};

module.exports = { authMiddleware, adminMiddleware };
