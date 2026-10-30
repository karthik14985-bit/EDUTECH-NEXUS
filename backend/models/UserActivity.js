const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  email: { type: String, required: true, lowercase: true, index: true },
  fullName: String,
  action: { type: String, enum: ['register', 'login', 'logout'], required: true, index: true },
  ipAddress: String,
  userAgent: String
}, { timestamps: { createdAt: true, updatedAt: false } });

schema.index({ createdAt: -1 });
module.exports = mongoose.model('UserActivity', schema);
