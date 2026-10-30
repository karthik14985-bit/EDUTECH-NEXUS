const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  companyLogo: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  companyEmail: { type: String, default: '' },
  companyContact: { type: String, default: '' },
  applicationMethod: { type: String, default: 'Platform Application' },
  description: { type: String, required: true },
  location: { type: String, default: 'Chennai, India' },
  workMode: { type: String, enum: ['Remote', 'Hybrid', 'On-site'], default: 'Hybrid' },
  mode: { type: String, default: 'Hybrid' }, // alias
  duration: { type: String, default: '3 Months' },
  skills: { type: [String], default: [] },
  stipend: { type: String, default: 'Performance Based' },
  fee: { type: Number, default: 0 },
  totalFee: { type: Number, default: 0 }, // alias
  type: { type: String, enum: ['Free', 'Paid'], default: 'Free' },
  applicationLink: { type: String, default: '' },
  deadline: {
    type: Date,
    default: () => new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
  },
  eligibility: { type: String, default: 'Open to 2nd, 3rd, and 4th year undergraduate students' },
  category: { type: String, default: 'Technology' },
  xpReward: { type: Number, default: 150 },
  isVerified: { type: Boolean, default: true },
  verificationDate: { type: Date, default: Date.now },
  source: { type: String, default: 'Platform Administrator Verified' },
  responsibilities: { type: [String], default: [] },
  requirements: { type: [String], default: [] },
  bookmarkedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isExample: { type: Boolean, default: false },
  disclaimer: {
    type: String,
    default: 'Notice: This is an opportunity listing managed and reviewed by EDUTECH NEXUS administration.'
  },
  status: { type: String, enum: ['active', 'inactive', 'closed', 'archived'], default: 'active', index: true }
}, { timestamps: true });

// Pre-save to sync aliases
internshipSchema.pre('save', function(next) {
  if (this.workMode && !this.mode) this.mode = this.workMode;
  if (this.mode && !this.workMode) this.workMode = this.mode;
  if (this.fee && !this.totalFee) this.totalFee = this.fee;
  if (this.totalFee && !this.fee) this.fee = this.totalFee;
  if (this.fee > 0) this.type = 'Paid';
  else this.type = 'Free';
  next();
});

module.exports = mongoose.model('Internship', internshipSchema);
