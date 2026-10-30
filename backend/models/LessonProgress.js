const mongoose = require('mongoose');

const lessonProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    index: true
  },
  lessonId: {
    type: String,
    required: true,
    index: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  xpAwarded: {
    type: Number,
    default: 50
  },
  xpEarned: {
    type: Number,
    default: 50
  }
}, { timestamps: true });

lessonProgressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });

lessonProgressSchema.pre('save', function(next) {
  if (this.userId && !this.studentId) this.studentId = this.userId;
  if (this.studentId && !this.userId) this.userId = this.studentId;
  if (this.userId && !this.user) this.user = this.userId;
  if (this.user && !this.userId) this.userId = this.user;

  if (this.courseId && !this.course) this.course = this.courseId;
  if (this.course && !this.courseId) this.courseId = this.course;

  if (this.xpAwarded && !this.xpEarned) this.xpEarned = this.xpAwarded;
  if (this.xpEarned && !this.xpAwarded) this.xpAwarded = this.xpEarned;
  next();
});

module.exports = mongoose.model('LessonProgress', lessonProgressSchema);
