const mongoose = require('mongoose');

const gameQuestionSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
  gameType: {
    type: String,
    enum: [
      'quiz',
      'debugging',
      'code-challenge',
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
  category: { type: String, default: 'General' },
  level: { type: Number, default: 1 },
  question: { type: String, required: true },
  codeSnippet: { type: String, default: '' },
  starterCode: { type: String, default: '' },
  options: [{ type: String }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Index number (0-3) or string answer
  expectedAnswer: { type: String, default: '' },
  hints: [{ type: String }],
  explanation: { type: String, default: '' },
  sqlScenario: {
    tables: [{ name: String, columns: [String], rows: [[mongoose.Schema.Types.Mixed]] }],
    expectedColumns: [String],
    expectedRows: [[mongoose.Schema.Types.Mixed]],
    sampleQuery: String
  },
  xp: { type: Number, default: 10 },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
  isActive: { type: Boolean, default: true, index: true }
}, { timestamps: true });

module.exports = mongoose.model('GameQuestion', gameQuestionSchema);
