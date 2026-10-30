const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  organizer: { type: String, default: 'EDUTECH NEXUS' },
  category: {
    type: String,
    enum: [
      'College Events',
      'Hackathons',
      'Hackathon',
      'Workshops',
      'Workshop',
      'Seminars',
      'Seminar',
      'Coding Competitions',
      'Coding Competition',
      'Government/Industry Events',
      'Student Technology Events',
      'Technology'
    ],
    default: 'Student Technology Events'
  },
  date: { type: Date, required: true },
  time: { type: String, default: '10:00 AM' },
  venue: { type: String, default: 'Virtual / Online' },
  mode: { type: String, enum: ['Online', 'Offline', 'Hybrid'], default: 'Hybrid' },
  registrationDeadline: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
  },
  eligibility: { type: String, default: 'Open to all registered technology students' },
  eventImage: { type: String, default: '' },
  image: { type: String, default: '' }, // alias
  registrationLink: { type: String, default: '' },
  isExternal: { type: Boolean, default: false },
  externalDisclaimer: {
    type: String,
    default: 'External Event: This opportunity is organized by an external partner or agency. Official guidelines apply.'
  },
  xpReward: { type: Number, default: 50 },
  maxParticipants: { type: Number, default: 100 },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true }
}, { timestamps: true });

eventSchema.pre('save', function(next) {
  if (this.eventImage && !this.image) this.image = this.eventImage;
  if (this.image && !this.eventImage) this.eventImage = this.image;
  next();
});

module.exports = mongoose.model('Event', eventSchema);
