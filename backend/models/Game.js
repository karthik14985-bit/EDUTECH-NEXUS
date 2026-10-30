const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, default: '' },
  expectedOutput: { type: String, required: true },
  description: { type: String, default: '' },
  isHidden: { type: Boolean, default: false }
}, { _id: true });

const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // 0-based index
  explanation: { type: String, default: '' }
}, { _id: true });

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, default: 'Technology' },
  gameType: {
    type: String,
    enum: [
      'code-challenge',
      'debugging',
      'quiz',
      'code-sprint',
      'logic-master',
      'bug-hunter',
      'sql-quest',
      'ai-arena',
      'memory-pattern',
      'web-design',
      'cyber-defender',
      'network-builder'
    ],
    default: 'quiz',
    index: true
  },
  slug: { type: String, trim: true, index: true },
  icon: { type: String, default: 'fa-gamepad' },
  color: { type: String, default: '#6c4cff' },
  tags: { type: [String], default: [] },
  rules: { type: [String], default: [] },
  playCount: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0 },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  xpReward: { type: Number, default: 50 },
  timeLimit: { type: Number, default: 600 }, // in seconds (e.g. 10 mins)
  starterCode: { type: String, default: '' },
  bugCode: { type: String, default: '' },
  bugDescription: { type: String, default: '' },
  solutionSnippet: { type: String, default: '' },
  testCases: { type: [testCaseSchema], default: [] },
  questions: { type: [questionSchema], default: [] },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true }
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
