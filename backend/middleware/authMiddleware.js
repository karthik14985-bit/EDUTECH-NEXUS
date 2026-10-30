const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function authenticateUser(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Authentication required' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: 'Session is invalid' });
    req.user = user;
    next();
  } catch (error) { return res.status(401).json({ success: false, message: 'Session is invalid or expired' }); }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ success: false, message: 'Administrator access required' });
  next();
}

async function authenticateOptionalUser(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(payload.id);
      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (_) {}
  next();
}

module.exports = { authenticateUser, requireAdmin, authenticateOptionalUser };
