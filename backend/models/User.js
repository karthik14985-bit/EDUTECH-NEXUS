const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, select: false },
  phone: { type: String, required: true, trim: true },
  age: { type: Number, min: 10, max: 120 },
  gender: { type: String, default: '' },
  userType: { type: String, enum: ['student', 'staff', 'worker', 'other'], default: 'student', index: true },
  institution: { type: String, default: '', index: true },
  company: { type: String, default: '', index: true },
  registerNumber: { type: String, unique: true, sparse: true, trim: true, index: true },
  studentId: { type: String, unique: true, sparse: true, trim: true, index: true },
  college: { type: String, default: '', index: true },
  department: { type: String, default: '', index: true },
  year: { type: String, default: '' },
  designation: { type: String, default: '' },
  occupation: { type: String, default: '' },
  state: { type: String, default: '' },
  city: { type: String, default: '' },
  address: { type: String, default: '' },
  skills: { type: [String], default: [] },
  bio: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  github: { type: String, default: '' },
  portfolio: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  profileImageUrl: { type: String, default: '' },
  dateOfBirth: Date,
  xp: { type: Number, default: 0, index: true },
  level: { type: Number, default: 1 },
  role: { type: String, enum: ['student', 'admin'], default: 'student', index: true },
  isActive: { type: Boolean, default: true },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  internships: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Internship' }],
  events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }],
  gameScores: [{
    game: { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
    score: Number,
    xpEarned: Number,
    date: { type: Date, default: Date.now }
  }],
  certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Certificate' }]
}, { timestamps: true });

// Pre-save hook to ensure registerNumber/studentId and institution/college sync
userSchema.pre('save', function(next) {
  if (this.registerNumber && !this.studentId) {
    this.studentId = this.registerNumber;
  } else if (this.studentId && !this.registerNumber) {
    this.registerNumber = this.studentId;
  }

  if (!this.registerNumber) {
    this.registerNumber = undefined;
    this.studentId = undefined;
  }

  if (this.institution && !this.college) {
    this.college = this.institution;
  } else if (this.college && !this.institution) {
    this.institution = this.college;
  }

  if (this.profileImage && !this.profileImageUrl) {
    this.profileImageUrl = this.profileImage;
  } else if (this.profileImageUrl && !this.profileImage) {
    this.profileImage = this.profileImageUrl;
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
