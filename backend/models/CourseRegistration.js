const mongoose = require('mongoose');

const courseRegistrationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  registrationDate: { type: Date, default: Date.now },
  registeredAt: { type: Date, default: Date.now }, // backward compat
  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedLessons: [{ type: String }], // lesson IDs or keys
  completed: { type: Boolean, default: false },
  status: { type: String, enum: ['registered', 'in_progress', 'completed'], default: 'registered' },
  completedAt: Date,
  certificateEligible: { type: Boolean, default: false },
  certificateClaimed: { type: Boolean, default: false },
  certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }
}, { timestamps: true });

courseRegistrationSchema.index({ user: 1, course: 1 }, { unique: true });

// Helper virtual to check if expired
courseRegistrationSchema.virtual('isExpired').get(function() {
  return this.expiryDate && new Date() > this.expiryDate;
});

courseRegistrationSchema.set('toJSON', { virtuals: true });
courseRegistrationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CourseRegistration', courseRegistrationSchema);
