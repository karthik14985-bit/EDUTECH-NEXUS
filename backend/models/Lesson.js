const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  lessonNumber: {
    type: Number,
    default: 1
  },
  order: {
    type: Number,
    default: 1
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  content: {
    type: String,
    default: ''
  },
  learningObjectives: {
    type: [String],
    default: []
  },
  objectives: {
    type: [String],
    default: []
  },
  duration: {
    type: String,
    default: '20 mins'
  },
  durationSeconds: {
    type: Number,
    default: 600
  },
  videoType: {
    type: String,
    enum: ['youtube', 'local', 'url', 'external'],
    default: 'youtube'
  },
  videoUrl: {
    type: String,
    default: ''
  },
  defaultVideo: {
    type: String,
    default: '/videos/sample-lesson.mp4'
  },
  youtubeVideoId: {
    type: String,
    default: ''
  },
  videoFile: {
    type: String,
    default: ''
  },
  xp: {
    type: Number,
    default: 50
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  }
}, { timestamps: true });

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

module.exports = mongoose.model('Lesson', lessonSchema);
