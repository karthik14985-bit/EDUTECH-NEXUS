const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
  registrationDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['registered', 'attended', 'cancelled'], default: 'registered' },
  xpAwarded: { type: Number, default: 50 }
}, { timestamps: true });

eventRegistrationSchema.index({ user: 1, event: 1 }, { unique: true });

eventRegistrationSchema.pre('save', function(next) {
  if (this.user && !this.studentId) this.studentId = this.user;
  if (this.studentId && !this.user) this.user = this.studentId;
  next();
});

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);
