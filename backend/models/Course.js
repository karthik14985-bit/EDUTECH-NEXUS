const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  lessonNumber: { type: Number, default: 1 },
  order: { type: Number, default: 1 },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  content: { type: String, default: '' },
  learningObjectives: { type: [String], default: [] },
  objectives: { type: [String], default: [] },
  duration: { type: String, default: '20 mins' },
  videoType: { type: String, enum: ['youtube', 'local', 'url', 'external'], default: 'youtube' },
  videoUrl: { type: String, default: '' },
  youtubeVideoId: { type: String, default: '' },
  videoFile: { type: String, default: '' },
  xp: { type: Number, default: 50 },
  isPublished: { type: Boolean, default: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { _id: true, timestamps: true });

lessonSchema.pre('save', function(next) {
  if (this.order && !this.lessonNumber) this.lessonNumber = this.order;
  if (this.lessonNumber && !this.order) this.order = this.lessonNumber;
  if (this.objectives && (!this.learningObjectives || !this.learningObjectives.length)) {
    this.learningObjectives = this.objectives;
  }
  if (this.learningObjectives && (!this.objectives || !this.objectives.length)) {
    this.objectives = this.learningObjectives;
  }
  next();
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, trim: true, index: true },
  shortDescription: { type: String, default: '' },
  description: { type: String, required: true },
  category: { type: String, default: 'General Technology', index: true },
  image: { type: String, default: '' },
  thumbnail: { type: String, default: '' },
  instructor: { type: String, default: 'EDUTECH NEXUS Faculty' },
  duration: { type: String, default: '6 weeks' },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  level: { type: String, default: 'Beginner' },
  requirements: { type: [String], default: [] },
  prerequisites: { type: [String], default: [] },
  learningOutcomes: { type: [String], default: [] },
  whatYouWillLearn: { type: [String], default: [] },
  xp: { type: Number, default: 500 },
  xpReward: { type: Number, default: 500 },
  totalLessons: { type: Number, default: 10 },
  syllabus: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive', 'published', 'draft'], default: 'active', index: true },
  accessDays: { type: Number, default: 30 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lessons: { type: [lessonSchema], default: [] }
}, { timestamps: true });

courseSchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  if (!this.shortDescription && this.description) {
    this.shortDescription = this.description.length > 160 ? this.description.slice(0, 157) + '...' : this.description;
  }
  if (!this.description && this.shortDescription) {
    this.description = this.shortDescription;
  }
  if (this.image && !this.thumbnail) this.thumbnail = this.image;
  if (this.thumbnail && !this.image) this.image = this.thumbnail;
  if (this.difficulty && !this.level) this.level = this.difficulty;
  if (this.level && !this.difficulty) this.difficulty = this.level;
  if (this.xp && !this.xpReward) this.xpReward = this.xp;
  if (this.xpReward && !this.xp) this.xp = this.xpReward;
  if (this.learningOutcomes && (!this.whatYouWillLearn || !this.whatYouWillLearn.length)) {
    this.whatYouWillLearn = this.learningOutcomes;
  }
  if (this.whatYouWillLearn && (!this.learningOutcomes || !this.learningOutcomes.length)) {
    this.learningOutcomes = this.whatYouWillLearn;
  }
  if (this.prerequisites && (!this.requirements || !this.requirements.length)) {
    this.requirements = this.prerequisites;
  }
  if (this.requirements && (!this.prerequisites || !this.prerequisites.length)) {
    this.prerequisites = this.requirements;
  }
  if (this.lessons && this.lessons.length > 0) {
    this.totalLessons = this.lessons.length;
  }
  next();
});

courseSchema.virtual('lessonCount').get(function() {
  return (this.lessons && this.lessons.length > 0) ? this.lessons.length : (this.totalLessons || 0);
});

courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
