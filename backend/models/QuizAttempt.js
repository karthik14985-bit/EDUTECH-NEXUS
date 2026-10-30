const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    default: 10
  },
  percentage: {
    type: Number,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  answers: {
    type: [Number],
    default: []
  },
  attemptedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, { timestamps: true });

quizAttemptSchema.pre('save', function(next) {
  if (this.userId && !this.studentId) this.studentId = this.userId;
  if (this.studentId && !this.userId) this.userId = this.studentId;
  next();
});

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
