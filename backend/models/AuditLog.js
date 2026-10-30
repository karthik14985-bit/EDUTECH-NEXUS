const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  entity: { type: String, required: true },
  entityId: String,
  details: mongoose.Schema.Types.Mixed,
  ipAddress: String
}, { timestamps: { createdAt: true, updatedAt: false } });
schema.index({ admin: 1, createdAt: -1 });
module.exports = mongoose.model('AuditLog', schema);
