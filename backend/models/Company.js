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
