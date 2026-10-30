const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  subject: { type: String, default: 'General Discussion', trim: true },
  message: { type: String, required: true, maxlength: 4000 },
  read: { type: Boolean, default: false }
}, { timestamps: { createdAt: true, updatedAt: false } });

messageSchema.pre('save', function(next) {
  if (this.senderId && !this.sender) this.sender = this.senderId;
  if (this.sender && !this.senderId) this.senderId = this.sender;
  if (this.receiverId && !this.receiver) this.receiver = this.receiverId;
  if (this.receiver && !this.receiverId) this.receiverId = this.receiver;
  next();
});

module.exports = mongoose.model('Message', messageSchema);
