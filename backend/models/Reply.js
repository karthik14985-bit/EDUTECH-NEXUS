const mongoose = require('mongoose');
module.exports = mongoose.model('Reply', new mongoose.Schema({ discussion: { type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' }, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, content: String }, { timestamps: true }));
