const mongoose = require('mongoose');

const xpTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  action: {
    type: String,
    required: true,
    default: 'lesson_completion'
  },
  source: { type: String, default: 'course' },
  referenceId: { type: String, default: '' },
  xp: { type: Number, required: true },
  amount: { type: Number },
  date: { type: Date, default: Date.now, index: true },
  description: { type: String, required: true },
  reason: { type: String }
}, { timestamps: { createdAt: true, updatedAt: false } });

xpTransactionSchema.pre('save', function(next) {
  if (this.userId && !this.studentId) this.studentId = this.userId;
  if (this.studentId && !this.userId) this.userId = this.studentId;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.user && !this.userId) this.userId = this.user;

  if (this.xp && !this.amount) this.amount = this.xp;
  if (this.amount && !this.xp) this.xp = this.amount;

  if (this.description && !this.reason) this.reason = this.description;
  if (this.reason && !this.description) this.description = this.reason;
  next();
});

module.exports = mongoose.model('XPTransaction', xpTransactionSchema);
