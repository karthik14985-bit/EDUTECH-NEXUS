const mongoose = require('mongoose');

const internshipApplicationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true,
    trim: true
  },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, // alias
  internshipId: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true, index: true },
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', index: true }, // alias
  fullName: { type: String, required: true, trim: true },
  age: { type: Number },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  userType: { type: String, enum: ['student', 'staff', 'worker', 'other'], default: 'student' },
  department: { type: String, default: '' },
  institution: { type: String, default: '' },
  college: { type: String, default: '' }, // alias
  year: { type: String, default: '' },
  registerNumber: { type: String, default: '' },
  company: { type: String, default: '' },
  jobRole: { type: String, default: '' },
  place: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: 'Tamil Nadu' },
  address: { type: String, default: '' },
  skills: { type: [String], default: [] },
  experience: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  resumeName: { type: String, default: '' },
  githubUrl: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  portfolioUrl: { type: String, default: '' },
  coverLetter: { type: String, default: '' },
  status: {
    type: String,
    enum: [
      'Draft',
      'Applied',
      'Submitted',
      'Under Review',
      'Shortlisted',
      'Interview',
      'Selected',
      'Rejected',
      'Withdrawn',
      'Completed'
    ],
    default: 'Applied',
    index: true
  },
  appliedAt: { type: Date, default: Date.now },
  withdrawnAt: { type: Date },
  withdrawalReason: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  statusHistory: [{
    status: { type: String, required: true },
    changedAt: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    changedBy: { type: String, default: 'System' }
  }]
}, { timestamps: true });

internshipApplicationSchema.index({ studentId: 1, internshipId: 1 }, { unique: true });

internshipApplicationSchema.pre('save', function(next) {
  if (this.studentId && !this.user) this.user = this.studentId;
  if (this.user && !this.studentId) this.studentId = this.user;
  if (this.internshipId && !this.internship) this.internship = this.internshipId;
  if (this.internship && !this.internshipId) this.internshipId = this.internship;
  if (this.institution && !this.college) this.college = this.institution;
  if (this.college && !this.institution) this.institution = this.college;
  next();
});

module.exports = mongoose.model('InternshipApplication', internshipApplicationSchema);
