const mongoose = require('mongoose');

const internshipBookmarkSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true, index: true },
  savedAt: { type: Date, default: Date.now }
}, { timestamps: true });

internshipBookmarkSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

module.exports = mongoose.model('InternshipBookmark', internshipBookmarkSchema);
