const mongoose = require('mongoose');

const clubMemberSchema = new mongoose.Schema({
  clubId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
    index: true
  },
  club: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  role: {
    type: String,
    enum: ['member', 'moderator', 'lead'],
    default: 'member'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

clubMemberSchema.index({ clubId: 1, studentId: 1 }, { unique: true });

clubMemberSchema.pre('save', function(next) {
  if (this.clubId && !this.club) this.club = this.clubId;
  if (this.club && !this.clubId) this.clubId = this.club;
  if (this.studentId && !this.user) this.user = this.studentId;
  if (this.user && !this.studentId) this.studentId = this.user;
  next();
});

module.exports = mongoose.model('ClubMember', clubMemberSchema);
