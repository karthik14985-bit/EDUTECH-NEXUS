const mongoose = require('mongoose');

const xpConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'default_xp_config', unique: true },
  courseRegistration: { type: Number, default: 10 },
  lessonCompletion: { type: Number, default: 20 },
  courseCompletion: { type: Number, default: 100 },
  certificateClaim: { type: Number, default: 150 },
  eventParticipation: { type: Number, default: 50 },
  gameParticipation: { type: Number, default: 20 },
  gameAchievement: { type: Number, default: 50 }
}, { timestamps: true });

module.exports = mongoose.model('XPConfig', xpConfigSchema);
