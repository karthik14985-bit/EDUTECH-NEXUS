const mongoose = require('mongoose');

const internshipRegistrationSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // alias
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true, index: true },
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', index: true }, // alias
  applicationDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Applied', 'Under Review', 'Selected', 'Rejected', 'Completed'],
    default: 'Applied'
  },
  coverNote: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  paymentStatus: {
    type: String,
    enum: ['not_required', 'pending', 'paid', 'demo_paid'],
    default: 'not_required'
  },
  demoPaymentDetails: {
    amount: Number,
    transactionId: String,
    paidAt: Date
  }
}, { timestamps: true });

internshipRegistrationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

internshipRegistrationSchema.pre('save', function(next) {
  if (this.studentId && !this.user) this.user = this.studentId;
  if (this.user && !this.studentId) this.studentId = this.user;
  if (this.internshipId && !this.internship) this.internship = this.internshipId;
  if (this.internship && !this.internshipId) this.internshipId = this.internship;
  next();
});

module.exports = mongoose.model('InternshipRegistration', internshipRegistrationSchema);
