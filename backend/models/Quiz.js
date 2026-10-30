const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
  questionNumber: { type: Number, required: true },
  questionText: { type: String, required: true, trim: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // 0-indexed option index
  explanation: { type: String, default: '' }
}, { _id: false });

const quizSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    default: 'Course Final Quiz'
  },
  questions: {
    type: [quizQuestionSchema],
    validate: [val => val.length > 0, 'Quiz must have at least one question']
  },
  passPercentage: {
    type: Number,
    default: 70
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
