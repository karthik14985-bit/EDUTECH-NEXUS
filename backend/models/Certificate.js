const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true,
    trim: true
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  studentName: { type: String, required: true },
  studentDepartment: { type: String, default: 'Engineering & Technology' },
  studentCollege: { type: String, default: 'EDUTECH NEXUS Academic Partner' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', index: true },
  courseName: { type: String, required: true },
  completionDate: { type: Date, default: Date.now },
  issueDate: { type: Date, default: Date.now },
  quizScore: { type: Number, default: 80 },
  xp: { type: Number, default: 200 },
  xpAwarded: { type: Number, default: 200 },
  awardedXP: { type: Number, default: 200 },
  verificationId: { type: String, index: true },
  verificationUrl: { type: String, default: '' },
  status: { type: String, enum: ['active', 'revoked'], default: 'active', index: true },
  title: { type: String, default: 'CERTIFICATE OF COMPLETION' },
  description: { type: String, default: 'For successfully completing the technical curriculum and final assessment with distinction.' }
}, { timestamps: true });

certificateSchema.index({ userId: 1, courseId: 1 }, { unique: true });

certificateSchema.pre('save', function(next) {
  if (this.userId && !this.studentId) this.studentId = this.userId;
  if (this.studentId && !this.userId) this.userId = this.studentId;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.user && !this.userId) this.userId = this.user;

  if (this.courseId && !this.course) this.course = this.courseId;
  if (this.course && !this.courseId) this.courseId = this.course;

  if (this.certificateId && !this.verificationId) this.verificationId = this.certificateId;
  if (this.verificationId && !this.certificateId) this.certificateId = this.verificationId;

  if (this.xp && !this.xpAwarded) this.xpAwarded = this.xp;
  if (this.xpAwarded && !this.xp) this.xp = this.xpAwarded;
  if (this.xp && !this.awardedXP) this.awardedXP = this.xp;

  if (!this.verificationUrl && this.certificateId) {
    this.verificationUrl = `/verify-certificate.html?id=${this.certificateId}`;
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
