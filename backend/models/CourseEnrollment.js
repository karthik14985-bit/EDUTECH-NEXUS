const mongoose = require('mongoose');

const courseEnrollmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // alias for userId
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // alias for userId
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true }, // alias for courseId
  enrolledAt: { type: Date, default: Date.now },
  registrationDate: { type: Date, default: Date.now },
  registeredAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedLessons: [{ type: String }],
  status: {
    type: String,
    enum: ['registered', 'in_progress', 'completed', 'expired'],
    default: 'registered'
  },
  completedAt: { type: Date },
  completed: { type: Boolean, default: false },
  quizScore: { type: Number, default: 0 },
  quizPassed: { type: Boolean, default: false },
  certificateEligible: { type: Boolean, default: false },
  certificateClaimed: { type: Boolean, default: false },
  certificate: { type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' },
  fullName: { type: String, default: '' },
  age: { type: Number },
  userType: { type: String, default: 'student' },
  institution: { type: String, default: '' },
  college: { type: String, default: '' },
  company: { type: String, default: '' },
  department: { type: String, default: '' },
  year: { type: String, default: '' },
  registerNumber: { type: String, default: '' },
  designation: { type: String, default: '' },
  occupation: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  expiryDate: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
}, { timestamps: true });

courseEnrollmentSchema.index({ userId: 1, courseId: 1 });
courseEnrollmentSchema.index({ studentId: 1, courseId: 1 });

courseEnrollmentSchema.virtual('isExpired').get(function() {
  return this.expiryDate && new Date() > this.expiryDate;
});

courseEnrollmentSchema.pre('save', function(next) {
  if (this.userId && !this.studentId) this.studentId = this.userId;
  if (this.studentId && !this.userId) this.userId = this.studentId;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.user && !this.userId) this.userId = this.user;

  if (this.courseId && !this.course) this.course = this.courseId;
  if (this.course && !this.courseId) this.courseId = this.course;

  if (this.enrolledAt && !this.registrationDate) this.registrationDate = this.enrolledAt;
  if (this.registrationDate && !this.enrolledAt) this.enrolledAt = this.registrationDate;

  if (this.institution && !this.college) this.college = this.institution;
  if (this.college && !this.institution) this.institution = this.college;

  if (this.progress === 100 && this.quizPassed) {
    this.status = 'completed';
    this.completed = true;
    if (!this.completedAt) this.completedAt = new Date();
    this.certificateEligible = true;
  }
  next();
});

courseEnrollmentSchema.set('toJSON', { virtuals: true });
courseEnrollmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CourseEnrollment', courseEnrollmentSchema);
