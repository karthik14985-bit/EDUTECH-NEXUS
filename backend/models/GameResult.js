const mongoose = require('mongoose');

const gameResponseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true }
}, { _id: false });

const gameResultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // alias
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true, index: true },
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', index: true }, // alias
  attemptId: { type: String, default: undefined },
  status: { type: String, enum: ['in-progress', 'completed'], default: 'completed' },
  responses: { type: [gameResponseSchema], default: [] },
  gameType: { type: String, default: 'code-challenge' },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, default: 0 },
  passedTestCases: { type: Number, default: 0 },
  totalTestCases: { type: Number, default: 0 },
  xp: { type: Number, default: 0 },
  xpEarned: { type: Number, default: 0 }, // alias
  submittedCode: { type: String, default: '' },
  timeTaken: { type: Number, default: 0 }, // in seconds
  date: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

gameResultSchema.index(
  { studentId: 1, gameId: 1, attemptId: 1 },
  { unique: true, partialFilterExpression: { attemptId: { $type: 'string' } } }
);

gameResultSchema.pre('save', function(next) {
  if (this.studentId && !this.user) this.user = this.studentId;
  if (this.user && !this.studentId) this.studentId = this.user;
  if (this.gameId && !this.game) this.game = this.gameId;
  if (this.game && !this.gameId) this.gameId = this.game;
  if (this.xp && !this.xpEarned) this.xpEarned = this.xp;
  if (this.xpEarned && !this.xp) this.xp = this.xpEarned;
  next();
});

module.exports = mongoose.model('GameResult', gameResultSchema);
