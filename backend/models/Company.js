const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true, index: true },
  logo: { type: String, default: '' },
  about: { type: String, default: '' },
  description: { type: String, default: '' },
  industry: { type: String, default: 'Technology & Services' },
  website: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: 'Chennai, Tamil Nadu, India' },
  companySize: { type: String, default: '1,000 - 10,000+ employees' },
  availableDomains: { type: [String], default: [] },
  requiredSkills: { type: [String], default: [] },
  eligibility: { type: String, default: 'Pre-final & Final year B.E / B.Tech / M.C.A students' },
  internshipDuration: { type: String, default: '3 to 6 Months' },
  applicationProcedure: { type: String, default: 'Online screening followed by technical assessment and HR interview.' },
  verificationStatus: {
    type: String,
    enum: ['Verified', 'Example Record', 'Pending Verification'],
    default: 'Example Record'
  },
  isExample: { type: Boolean, default: true },
  notes: { type: String, default: 'Verify details on the official company website.' },
  profilePdfUrl: { type: String, default: '' }
}, { timestamps: true });

companySchema.pre('save', function(next) {
  if (this.verificationStatus === 'Verified') {
    this.isExample = false;
  } else {
    this.isExample = true;
  }
  next();
});

module.exports = mongoose.model('Company', companySchema);
