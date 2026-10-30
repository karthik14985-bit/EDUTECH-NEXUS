const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  category: { type: String, default: 'General', index: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'hidden'], default: 'active', index: true }
}, { timestamps: true });

module.exports = mongoose.model('Discussion', discussionSchema);
