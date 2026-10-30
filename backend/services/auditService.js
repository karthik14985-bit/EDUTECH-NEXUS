const AuditLog = require('../models/AuditLog');
async function recordAudit(req, action, entity, entityId, details = {}) {
  if (!req.user?._id) return;
  await AuditLog.create({ admin: req.user._id, action, entity, entityId: entityId ? String(entityId) : undefined, details, ipAddress: req.ip });
}
module.exports = { recordAudit };
