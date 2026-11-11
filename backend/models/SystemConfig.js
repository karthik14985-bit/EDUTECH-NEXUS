const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  key: { type: String, default: 'certificate_config', unique: true },
  organizationName: { type: String, default: 'EDUTECH NEXUS' },
  adminName: { type: String, default: 'Course Administrator' },
  adminDesignation: { type: String, default: 'Course Administrator' },
  adminSignature: { type: String, default: 'Course Administrator' },
  certificateHeading: { type: String, default: 'CERTIFICATE OF COMPLETION' },
  mainHeading: { type: String, default: 'THIS CERTIFICATE IS PROUDLY PRESENTED TO' },
  certificateDescription: {
    type: String,
    default: 'This certificate is awarded in recognition of successfully completing the course and fulfilling all learning requirements.'
  }
}, { timestamps: true });

module.exports = mongoose.model('SystemConfig', systemConfigSchema);

