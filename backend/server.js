require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');

const connectDatabase = require('./config/db');

// Models
const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const CourseRegistration = require('./models/CourseRegistration');
const CourseEnrollment = require('./models/CourseEnrollment');
const LessonProgress = require('./models/LessonProgress');
const Certificate = require('./models/Certificate');
const Quiz = require('./models/Quiz');
const QuizAttempt = require('./models/QuizAttempt');
const Internship = require('./models/Internship');
const InternshipRegistration = require('./models/InternshipRegistration');
const InternshipApplication = require('./models/InternshipApplication');
const InternshipBookmark = require('./models/InternshipBookmark');
const Company = require('./models/Company');
const CompanyDocument = require('./models/CompanyDocument');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const Game = require('./models/Game');
const GameQuestion = require('./models/GameQuestion');
const GameResult = require('./models/GameResult');
const Discussion = require('./models/Discussion');
const Reply = require('./models/Reply');
const DiscussionReply = require('./models/DiscussionReply');
const Message = require('./models/Message');
const Club = require('./models/Club');
const ClubMember = require('./models/ClubMember');
const PasswordResetToken = require('./models/PasswordResetToken');
const AuditLog = require('./models/AuditLog');
const UserActivity = require('./models/UserActivity');
const XPTransaction = require('./models/XPTransaction');
const XPConfig = require('./models/XPConfig');
const Notification = require('./models/Notification');

// Middleware & Services
const { authenticateUser, requireAdmin, authenticateOptionalUser } = require('./middleware/authMiddleware');
const { awardXP, calculateLevel, getXPConfig } = require('./services/xpService');
const { recordAudit } = require('./services/auditService');
const { sendPasswordResetEmail, sendInternshipNotificationEmail } = require('./services/emailService');
const { ensureDefaultAccounts } = require('./services/initDefaults');

const app = express();

// Security & Parsing
app.use(helmet({
  contentSecurityPolicy: false, // Allow CDN resources for fonts, font awesome, etc.
  crossOriginResourcePolicy: false
}));

const allowedOrigins = (process.env.CLIENT_URL || '').split(',').map(origin => origin.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // In local development or intranet testing, permit requests gracefully
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(morgan('dev'));

// Static serving for frontend
const frontendPath = path.join(__dirname, '../frontend');
const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}
app.use(express.static(frontendPath));

// Controlled Course Video Storage (Requirement 7: backend/uploads/course-videos/)
const courseVideosDir = path.join(__dirname, 'uploads', 'course-videos');
if (!fs.existsSync(courseVideosDir)) {
  fs.mkdirSync(courseVideosDir, { recursive: true });
}

// Frontend static video upload directory (for backwards compatibility)
const videoUploadDir = path.join(frontendPath, 'videos', 'uploads');
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

// HTTP Byte-Range Video Streaming Handler (Requirement C, Checklist C & B)
function streamVideoFile(req, res, filePath) {
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Video file not found' });
  }

  let stats;
  try {
    stats = fs.statSync(filePath);
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error accessing video file' });
  }

  if (stats.isDirectory()) {
    return res.status(403).json({ success: false, message: 'Invalid video file path' });
  }

  const ext = path.extname(filePath).toLowerCase();
  const mimeMap = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.mov': 'video/quicktime'
  };
  const contentType = mimeMap[ext] || 'video/mp4';
  const fileSize = stats.size;

  // Handle empty file (0 bytes) safely
  if (fileSize === 0) {
    res.writeHead(200, {
      'Content-Length': 0,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    });
    return res.end();
  }

  const range = req.headers.range;

  if (range) {
    const match = range.match(/bytes=(\d*)-(\d*)/);
    if (!match) {
      res.setHeader('Content-Range', `bytes */${fileSize}`);
      return res.status(416).send('Malformed Range Header');
    }

    let start = match[1] ? parseInt(match[1], 10) : undefined;
    let end = match[2] ? parseInt(match[2], 10) : undefined;

    if (start === undefined && end !== undefined) {
      start = Math.max(0, fileSize - end);
      end = fileSize - 1;
    } else if (start !== undefined && end === undefined) {
      end = fileSize - 1;
    }

    if (isNaN(start) || isNaN(end) || start > end || start >= fileSize || end >= fileSize) {
      res.setHeader('Content-Range', `bytes */${fileSize}`);
      return res.status(416).send('Range Not Satisfiable');
    }

    const chunkSize = (end - start) + 1;
    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType
    });

    const stream = fs.createReadStream(filePath, { start, end });
    stream.on('error', (err) => {
      console.error('[VIDEO STREAM ERROR]', err.message);
      if (!res.headersSent) res.status(500).end('Streaming error');
      else res.end();
    });
    res.on('close', () => {
      if (!res.writableFinished) stream.destroy();
    });
    stream.pipe(res);
  } else {
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    });

    const stream = fs.createReadStream(filePath);
    stream.on('error', (err) => {
      console.error('[VIDEO STREAM ERROR]', err.message);
      if (!res.headersSent) res.status(500).end('Streaming error');
      else res.end();
    });
    res.on('close', () => {
      if (!res.writableFinished) stream.destroy();
    });
    stream.pipe(res);
  }
}

// Video streaming routes with directory traversal prevention
app.get('/uploads/course-videos/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const safePath = path.resolve(courseVideosDir, filename);
  if (!safePath.startsWith(courseVideosDir + path.sep)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  streamVideoFile(req, res, safePath);
});

app.get('/videos/*', (req, res, next) => {
  const reqUrl = decodeURIComponent(req.path);
  const relPath = reqUrl.replace(/^\/videos\/?/, '');
  if (!relPath) return next();

  const ext = path.extname(relPath).toLowerCase();
  if (!['.mp4', '.webm', '.mov'].includes(ext)) {
    return next();
  }

  const baseCandidates = [
    { base: path.join(frontendPath, 'videos'), target: path.resolve(path.join(frontendPath, 'videos'), relPath) },
    { base: path.join(publicPath, 'videos'), target: path.resolve(path.join(publicPath, 'videos'), relPath) },
    { base: courseVideosDir, target: path.resolve(courseVideosDir, path.basename(relPath)) },
    { base: videoUploadDir, target: path.resolve(videoUploadDir, path.basename(relPath)) }
  ];

  for (const item of baseCandidates) {
    if (item.target.startsWith(item.base) && fs.existsSync(item.target) && !fs.statSync(item.target).isDirectory()) {
      return streamVideoFile(req, res, item.target);
    }
  }

  // Missing video file -> 404 (do NOT silently send sample-lesson.mp4)
  return res.status(404).json({ success: false, message: 'Video not found' });
});

const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, courseVideosDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 40);
    const rand = crypto.randomBytes(6).toString('hex');
    cb(null, `${safeBase}_${Date.now()}_${rand}${ext}`);
  }
});

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 250 * 1024 * 1024 }, // 250MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.mp4', '.webm', '.mov'];
    const dangerous = ['.exe', '.sh', '.bat', '.cmd', '.js', '.vbs', '.msi', '.php', '.py'];
    if (dangerous.includes(ext)) {
      return cb(new Error('Executable and script files are strictly prohibited.'));
    }
    if (!allowed.includes(ext)) {
      return cb(new Error('Only video files (.mp4, .webm, .mov) are allowed.'));
    }
    if (file.mimetype && !file.mimetype.startsWith('video/') && file.mimetype !== 'application/octet-stream') {
      return cb(new Error('Invalid video MIME type.'));
    }
    cb(null, true);
  }
});

// Helper: Safely remove an unreferenced local video from disk (Requirement 8, 11, 12)
async function safeDeleteLocalVideo(videoUrlOrFile) {
  if (!videoUrlOrFile || typeof videoUrlOrFile !== 'string') return;
  const normalized = videoUrlOrFile.trim();
  if (!normalized.startsWith('/uploads/course-videos/') && !normalized.startsWith('/videos/uploads/')) {
    return; // Do not touch seed videos or external URLs
  }

  // Check if any remaining lesson in Course or standalone Lesson references this video
  const CourseModel = mongoose.model('Course');
  const LessonModel = mongoose.model('Lesson');

  const refInCourse = await CourseModel.findOne({
    $or: [
      { 'lessons.videoFile': normalized },
      { 'lessons.videoUrl': normalized }
    ]
  });
  const refInLesson = await LessonModel.findOne({
    $or: [
      { videoFile: normalized },
      { videoUrl: normalized }
    ]
  });

  if (!refInCourse && !refInLesson) {
    let targetPath = '';
    if (normalized.startsWith('/uploads/course-videos/')) {
      targetPath = path.join(courseVideosDir, path.basename(normalized));
    } else if (normalized.startsWith('/videos/uploads/')) {
      targetPath = path.join(videoUploadDir, path.basename(normalized));
    }
    if (targetPath && fs.existsSync(targetPath)) {
      try {
        fs.unlinkSync(targetPath);
        console.log(`[STORAGE] Deleted unreferenced video file: ${targetPath}`);
      } catch (err) {
        console.warn(`[STORAGE] Could not delete video file ${targetPath}:`, err.message);
      }
    }
  }
}

// Helpers
const asyncRoute = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

const publicUser = user => ({
  id: user._id,
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  username: user.username || user.email.split('@')[0],
  phone: user.phone || '',
  age: user.age || null,
  gender: user.gender || '',
  userType: user.userType || 'student',
  institution: user.institution || user.college || '',
  college: user.college || user.institution || '',
  company: user.company || '',
  department: user.department || '',
  year: user.year || '',
  registerNumber: user.registerNumber || user.studentId || '',
  studentId: user.studentId || user.registerNumber || '',
  designation: user.designation || '',
  occupation: user.occupation || '',
  state: user.state || '',
  city: user.city || '',
  address: user.address || '',
  skills: user.skills || [],
  bio: user.bio || '',
  linkedin: user.linkedin || '',
  github: user.github || '',
  portfolio: user.portfolio || '',
  profileImage: user.profileImage || user.profileImageUrl || '',
  profileImageUrl: user.profileImageUrl || user.profileImage || '',
  xp: user.xp || 0,
  level: user.level || 1,
  role: user.role || 'student',
  isActive: user.isActive !== false,
  createdAt: user.createdAt
});

const sign = user => jwt.sign(
  { id: user._id, role: user.role, userType: user.userType || 'student' },
  process.env.JWT_SECRET || 'edutech-nexus-secret-jwt-key',
  { expiresIn: '7d' }
);

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(400).json({ success: false, message: result.array()[0].msg });
  next();
};

const recordUserActivity = (req, user, action) => {
  return UserActivity.create({
    user: user?._id,
    email: user?.email || req.body?.email || req.body?.login || 'unknown',
    fullName: user?.fullName || 'Anonymous',
    action,
    ipAddress: req.ip,
    userAgent: req.get('user-agent') || ''
  }).catch(() => {});
};

// ==========================================
// 1. HEALTH & ROOT
// ==========================================
app.get('/api/health', (req, res) => res.json({ success: true, service: 'EDUTECH NEXUS API', status: 'operational' }));

// ==========================================
// 2. AUTHENTICATION ROUTES
// ==========================================
app.post('/api/auth/register', [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().normalizeEmail().withMessage('A valid email address is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validate, asyncRoute(async (req, res) => {
  const {
    fullName,
    email,
    password,
    confirmPassword,
    phone,
    age,
    gender,
    userType = 'student',
    institution,
    college,
    department,
    year,
    registerNumber,
    studentId,
    company,
    designation,
    jobRole,
    occupation,
    city,
    state,
    address,
    profileImage,
    profileImageUrl
  } = req.body;

  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }

  const rawUsername = (req.body.username || email.split('@')[0] || `user_${Date.now()}`).toLowerCase().trim();
  const normalizedEmail = email.toLowerCase().trim();

  // Validate conditional fields based on userType
  const uType = (userType || 'student').toLowerCase();
  const instName = (institution || college || '').trim();
  const compName = (company || '').trim();
  const desig = (designation || jobRole || '').trim();
  const occup = (occupation || '').trim();
  const regNum = (registerNumber || studentId || '').trim();

  if (uType === 'student') {
    if (!instName) return res.status(400).json({ success: false, message: 'Institution / College name is required for students.' });
    if (!department) return res.status(400).json({ success: false, message: 'Department is required for students.' });
    if (!year) return res.status(400).json({ success: false, message: 'Academic year is required for students.' });
    if (!regNum) return res.status(400).json({ success: false, message: 'Register number is required for students.' });
  } else if (uType === 'staff') {
    if (!instName) return res.status(400).json({ success: false, message: 'Institution name is required for staff.' });
    if (!department) return res.status(400).json({ success: false, message: 'Department is required for staff.' });
    if (!desig) return res.status(400).json({ success: false, message: 'Designation is required for staff.' });
  } else if (uType === 'worker') {
    if (!compName) return res.status(400).json({ success: false, message: 'Company name is required for workers.' });
    if (!desig) return res.status(400).json({ success: false, message: 'Designation / Job Role is required for workers.' });
  } else if (uType === 'other') {
    if (!instName && !compName) return res.status(400).json({ success: false, message: 'Organization / Company name is required.' });
    if (!occup) return res.status(400).json({ success: false, message: 'Occupation is required.' });
  }

  // Check unique constraints (case-insensitive)
  const emailRegex = new RegExp(`^${normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
  const userRegex = new RegExp(`^${rawUsername.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

  const existingEmail = await User.findOne({ email: emailRegex });
  if (existingEmail) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const existingUser = await User.findOne({ username: userRegex });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Username already exists.' });
  }

  if (uType === 'student' && regNum) {
    const existingReg = await User.findOne({
      $or: [{ registerNumber: regNum }, { studentId: regNum }]
    });
    if (existingReg) {
      return res.status(409).json({ success: false, message: 'Register number is already registered.' });
    }
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const skillsArray = Array.isArray(req.body.skills)
    ? req.body.skills
    : String(req.body.skills || '').split(',').map(s => s.trim()).filter(Boolean);

  const parsedAge = age ? Number(age) : undefined;

  const userPlace = (req.body.place || city || '').trim();
  const regNumberClean = (uType === 'student' && regNum) ? regNum : undefined;

  const user = await User.create({
    fullName: fullName.trim(),
    email: normalizedEmail,
    username: rawUsername,
    password: hashedPassword,
    phone: phone ? phone.trim() : '',
    age: parsedAge,
    gender: gender || '',
    userType: uType,
    institution: instName,
    college: instName,
    company: compName,
    department: department ? department.trim() : '',
    year: year ? String(year).trim() : '',
    registerNumber: regNumberClean,
    studentId: regNumberClean,
    designation: desig,
    occupation: occup,
    state: state ? state.trim() : 'Tamil Nadu',
    city: userPlace,
    address: address ? address.trim() : '',
    skills: skillsArray,
    bio: req.body.bio || '',
    profileImage: profileImage || profileImageUrl || '',
    profileImageUrl: profileImageUrl || profileImage || '',
    xp: 0,
    level: 1,
    role: 'student',
    isActive: true,
    enrolledCourses: [],
    internships: [],
    events: [],
    gameScores: [],
    certificates: []
  });

  await recordUserActivity(req, user, 'register');

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please login.',
    token: sign(user),
    user: publicUser(user)
  });
}));

app.post('/api/auth/login', [
  body('password').notEmpty().withMessage('Password is required')
], validate, asyncRoute(async (req, res) => {
  const rawInput = (req.body.emailOrUsername || req.body.usernameOrEmail || req.body.login || req.body.email || req.body.username || req.body.identifier || '').trim();
  if (!rawInput) return res.status(400).json({ success: false, message: 'Please enter your username or email.' });

  const escaped = rawInput.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const safeRegex = new RegExp(`^${escaped}$`, 'i');

  const user = await User.findOne({
    $or: [
      { email: safeRegex },
      { username: safeRegex },
      { registerNumber: safeRegex },
      { studentId: safeRegex }
    ]
  }).select('+password');

  if (!user) {
    console.log(`[AUTH] Login 401: No account matching "${rawInput}"`);
    return res.status(401).json({ success: false, message: 'Invalid email/username or password.' });
  }

  if (!user.isActive) {
    console.log(`[AUTH] Login 403: User "${user.email}" is deactivated.`);
    return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact administrator.' });
  }

  const isMatch = await bcrypt.compare(req.body.password, user.password);
  if (!isMatch) {
    console.log(`[AUTH] Login 401: Incorrect password entered for "${user.email}"`);
    return res.status(401).json({ success: false, message: 'Invalid email/username or password.' });
  }

  await recordUserActivity(req, user, 'login');
  console.log(`[AUTH] Login 200: Successfully authenticated "${user.email}" (Role: ${user.role})`);

  res.json({
    success: true,
    message: 'Login successful',
    token: sign(user),
    user: publicUser(user)
  });
}));

app.post('/api/auth/logout', authenticateUser, asyncRoute(async (req, res) => {
  await recordUserActivity(req, req.user, 'logout');
  res.json({ success: true, message: 'Logged out successfully' });
}));

app.get('/api/auth/me', authenticateUser, (req, res) => {
  res.json({ success: true, user: publicUser(req.user) });
});

app.post('/api/auth/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
], validate, asyncRoute(async (req, res) => {
  const generic = {
    success: true,
    message: 'If an account exists for this email, password reset instructions have been generated.'
  };

  const user = await User.findOne({ email: req.body.email, isActive: true });
  if (!user) return res.json(generic);

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  await PasswordResetToken.findOneAndUpdate(
    { user: user._id },
    { tokenHash, expiresAt: new Date(Date.now() + 30 * 60 * 1000), used: false },
    { upsert: true }
  );

  const resetUrl = `reset-password.html?token=${rawToken}`;
  console.log(`[AUTH] Password reset requested for ${user.email}. Development Reset URL: ${resetUrl}`);

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (error) {
    console.error('Password reset email notification error:', error.message);
  }

  // Include devResetUrl for seamless local testing if SMTP is not configured
  res.json({
    ...generic,
    devResetUrl: resetUrl
  });
}));

app.post('/api/auth/reset-password', [
  body('token').trim().notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validate, asyncRoute(async (req, res) => {
  const tokenHash = crypto.createHash('sha256').update(req.body.token.trim()).digest('hex');
  const reset = await PasswordResetToken.findOne({
    tokenHash,
    used: false,
    expiresAt: { $gt: new Date() }
  });

  if (!reset) {
    return res.status(400).json({ success: false, message: 'Password reset link is invalid or has expired.' });
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 12);
  await User.findByIdAndUpdate(reset.user, { password: hashedPassword });

  reset.used = true;
  await reset.save();

  res.json({ success: true, message: 'Password reset successful. You may now login with your new password.' });
}));

app.post('/api/auth/change-password', authenticateUser, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], validate, asyncRoute(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!isMatch) return res.status(400).json({ success: false, message: 'Current password is incorrect.' });

  user.password = await bcrypt.hash(req.body.newPassword, 12);
  await user.save();

  res.json({ success: true, message: 'Password updated successfully.' });
}));

// ==========================================
// 3. USER & PROFILE ROUTES
// ==========================================
const handleProfileGet = asyncRoute(async (req, res) => {
  const [coursesCount, certificatesCount, eventsCount, gameCount] = await Promise.all([
    CourseRegistration.countDocuments({ user: req.user._id }),
    Certificate.countDocuments({ user: req.user._id, status: 'active' }),
    EventRegistration.countDocuments({ user: req.user._id }),
    GameResult.countDocuments({ user: req.user._id, status: { $ne: 'in-progress' } })
  ]);

  res.json({
    success: true,
    user: {
      ...publicUser(req.user),
      stats: {
        coursesEnrolled: coursesCount,
        certificatesEarned: certificatesCount,
        eventsParticipated: eventsCount,
        gamesPlayed: gameCount
      }
    }
  });
});

app.get('/api/users/profile', authenticateUser, handleProfileGet);
app.get('/api/profile', authenticateUser, handleProfileGet);

const handleProfileUpdate = asyncRoute(async (req, res) => {
  const allowed = [
    'fullName', 'phone', 'college', 'department', 'year', 'state', 'city',
    'skills', 'bio', 'profileImageUrl', 'linkedin', 'github', 'portfolio'
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      if (key === 'skills' && !Array.isArray(req.body[key])) {
        updates[key] = String(req.body[key]).split(',').map(s => s.trim()).filter(Boolean);
      } else {
        updates[key] = req.body[key];
      }
    }
  }

  const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
  res.json({ success: true, message: 'Profile updated successfully', user: publicUser(updated) });
});

app.put('/api/users/profile', authenticateUser, handleProfileUpdate);
app.put('/api/profile', authenticateUser, handleProfileUpdate);
app.put('/api/users/password', authenticateUser, asyncRoute(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: 'Valid new password of at least 8 characters is required.' });
  }
  const user = await User.findById(req.user._id).select('+password');
  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
  }
  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();
  res.json({ success: true, message: 'Password updated successfully.' });
}));

// ==========================================
// 4. LEADERBOARD ROUTES
// ==========================================
// Section 7: GET /api/leaderboard/top3
const handleTopLeaderboard = asyncRoute(async (req, res) => {
  const topUsers = await User.find({ role: 'student', isActive: true })
    .select('fullName department college xp level')
    .sort({ xp: -1 })
    .limit(3);

  const medals = ['🥇', '🥈', '🥉'];
  const formatted = topUsers.map((u, i) => ({
    rank: i + 1,
    medal: medals[i] || `#${i + 1}`,
    name: u.fullName,
    department: u.department || 'Technology',
    college: u.college || 'Engineering',
    xp: u.xp || 0,
    level: u.level || 1
  }));

  res.json({ success: true, top3: formatted, top: formatted, users: formatted });
});

app.get('/api/leaderboard/top3', handleTopLeaderboard);
app.get('/api/leaderboard/top', handleTopLeaderboard);

// Full leaderboard
app.get('/api/leaderboard', asyncRoute(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const users = await User.find({ role: 'student', isActive: true })
    .select('fullName department college xp level')
    .sort({ xp: -1 })
    .limit(limit);

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    name: u.fullName,
    department: u.department || 'Technology',
    college: u.college || 'Engineering',
    xp: u.xp || 0,
    level: u.level || 1,
    badge: (u.xp || 0) >= 1500 ? 'Master' : (u.xp || 0) >= 1000 ? 'Expert' : (u.xp || 0) >= 500 ? 'Achiever' : 'Starter'
  }));

  res.json({ success: true, leaderboard });
}));

// ==========================================
// 5. COURSE & LESSON ROUTES
// ==========================================

// Helper to decode user optionally (for public routes that can include personal progress)
const getOptionalUser = async (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.slice(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'edutech-nexus-local-development-secret-change-before-deployment');
      return await User.findById(decoded.id);
    } catch (_) {}
  }
  return null;
};

function getEnrollmentFilter(userId, courseId) {
  return {
    $and: [
      { $or: [{ userId }, { studentId: userId }, { user: userId }] },
      { $or: [{ courseId }, { course: courseId }] }
    ]
  };
}

async function findCourseByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await Course.findById(idOrSlug);
    if (byId) return byId;
  }
  return await Course.findOne({ slug: idOrSlug });
}

function getStudentCourseVideoFolder(course) {
  if (!course) return 'course1';
  const title = (course.title || '').toLowerCase();
  const slug = (course.slug || '').toLowerCase();
  const name = `${title} ${slug}`;
  const normalizedName = name.replace(/[^a-z0-9]+/g, ' ').trim();

  if (normalizedName.includes('python')) return 'python';
  if (normalizedName.includes('machine learning') || normalizedName.includes('ai ml') || normalizedName.includes('aiml')) return 'ai-ml';
  if (normalizedName.includes('full stack') || normalizedName.includes('fullstack')) return 'fullstack';
  if (normalizedName.includes('ai fundamentals') || normalizedName.includes('artificial intelligence') || normalizedName === 'ai') return 'ai';
  return 'course1';
}

// Video URL Extractor Helper (Supports watch?v=, youtu.be, shorts, embed, and 11-char IDs)
function extractYtId(input) {
  if (!input) return '';
  const str = String(input).trim();
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (match && match[1]) return match[1];
  if (/^[\w-]{11}$/.test(str)) return str;
  return '';
}

function attachStudentCourseVideos(courseData, course) {
  const videoFolder = getStudentCourseVideoFolder(course);

  courseData.lessons = (courseData.lessons || []).map((lesson, index) => {
    const lessonData = lesson.toObject ? lesson.toObject() : { ...lesson };
    const lessonNumber = lessonData.lessonNumber || index + 1;

    let vType = (lessonData.videoType || '').toLowerCase();
    const rawUrl = (lessonData.videoUrl || '').trim();
    const rawFile = (lessonData.videoFile || '').trim();
    const ytIdFromId = extractYtId(lessonData.youtubeVideoId);
    const ytIdFromUrl = extractYtId(rawUrl);

    // An explicitly configured local file takes precedence over a YouTube fallback.
    const configuredLocalFile = [rawFile, rawUrl].find(p =>
      typeof p === 'string' &&
      (p.startsWith('/uploads/course-videos/') || p.startsWith('uploads/course-videos/') || p.startsWith('/videos/') || p.startsWith('videos/'))
    );
    if (configuredLocalFile) {
      const resolvedLocal = configuredLocalFile.startsWith('/') ? configuredLocalFile : `/${configuredLocalFile}`;
      return {
        ...lessonData,
        videoType: 'local',
        videoFile: resolvedLocal,
        videoUrl: resolvedLocal,
        youtubeVideoId: ''
      };
    }

    // 1. YouTube video check (explicit type, URL match, or existing YouTube ID)
    const validYtId = ytIdFromId || ytIdFromUrl;
    const isYtUrl = rawUrl.includes('youtube.com') || rawUrl.includes('youtu.be');

    if (validYtId) {
      return {
        ...lessonData,
        videoType: 'youtube',
        youtubeVideoId: validYtId,
        videoUrl: `https://www.youtube.com/watch?v=${validYtId}`,
        videoFile: rawFile || ''
      };
    }

    if (vType === 'youtube' && isYtUrl) {
      // It's a YouTube link without an extracted 11-char ID (invalid/malformed YouTube link)
      return {
        ...lessonData,
        videoType: 'youtube',
        youtubeVideoId: '',
        videoUrl: rawUrl,
        videoFile: ''
      };
    }

    // 2. Local uploaded video or local file path
    const localPathCandidates = [rawFile, rawUrl].filter(Boolean);
    const foundLocal = localPathCandidates.find(p =>
      typeof p === 'string' && (p.startsWith('/uploads/course-videos/') || p.startsWith('uploads/course-videos/') || p.startsWith('/videos/') || p.startsWith('videos/'))
    );

    if (foundLocal || vType === 'local') {
      let resolvedLocal = foundLocal || rawFile || rawUrl;
      if (resolvedLocal && !resolvedLocal.startsWith('/')) resolvedLocal = '/' + resolvedLocal;

      // If no file path given, check if a curriculum video exists on disk
      if (!resolvedLocal) {
        const potentialDiskPath = path.join(frontendPath, 'videos', videoFolder, `lesson${lessonNumber}.mp4`);
        if (fs.existsSync(potentialDiskPath)) {
          resolvedLocal = `/videos/${videoFolder}/lesson${lessonNumber}.mp4`;
        }
      }

      return {
        ...lessonData,
        videoType: 'local',
        videoFile: resolvedLocal || '',
        videoUrl: resolvedLocal || '',
        youtubeVideoId: ''
      };
    }

    // 3. Direct external video URL (.mp4, .webm, .mov, etc.)
    if (vType === 'url' || vType === 'external' || /^https?:\/\//i.test(rawUrl)) {
      return {
        ...lessonData,
        videoType: 'url',
        videoUrl: rawUrl,
        videoFile: '',
        youtubeVideoId: ''
      };
    }

    // 4. Default: check if static video exists on disk for this curriculum lesson
    const defaultDiskPath = path.join(frontendPath, 'videos', videoFolder, `lesson${lessonNumber}.mp4`);
    if (fs.existsSync(defaultDiskPath)) {
      const defaultUrl = `/videos/${videoFolder}/lesson${lessonNumber}.mp4`;
      return {
        ...lessonData,
        videoType: 'local',
        videoFile: defaultUrl,
        videoUrl: defaultUrl,
        youtubeVideoId: ''
      };
    }

    return {
      ...lessonData,
      videoType: vType || 'none',
      videoFile: rawFile || '',
      videoUrl: rawUrl || '',
      youtubeVideoId: ''
    };
  });

  return courseData;
}

function getCourseDurationDays(course) {
  const duration = String(course.duration || '');
  const match = duration.match(/(\d+(?:\.\d+)?)\s*(day|week|month|year)s?/i);
  if (!match) return Number(course.accessDays) || 30;

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const daysPerUnit = unit.startsWith('week') ? 7 : unit.startsWith('month') ? 30 : unit.startsWith('year') ? 365 : 1;
  return Math.max(1, Math.round(amount * daysPerUnit));
}

function getCourseExpiryDate(course, startDate) {
  const expiryDate = new Date(startDate);
  expiryDate.setDate(expiryDate.getDate() + getCourseDurationDays(course));
  return expiryDate;
}

async function findUserEnrollment(userId, courseId, course = null) {
  course = course || await findCourseByIdOrSlug(courseId);
  let enrollment = await CourseEnrollment.findOne(getEnrollmentFilter(userId, courseId));
  if (!enrollment) {
    const reg = await CourseRegistration.findOne({
      $and: [
        { $or: [{ user: userId }, { userId }, { studentId: userId }] },
        { $or: [{ course: courseId }, { courseId }] }
      ]
    });
    if (reg) {
      try {
        enrollment = await CourseEnrollment.create({
          userId,
          studentId: userId,
          user: userId,
          courseId,
          course: courseId,
          progress: reg.progress || 0,
          completedLessons: reg.completedLessons || [],
          status: reg.status || 'registered',
          completed: reg.completed || false,
          enrolledAt: reg.registrationDate || new Date(),
          registrationDate: reg.registrationDate || new Date(),
          registeredAt: reg.registeredAt || new Date(),
          expiryDate: course
            ? getCourseExpiryDate(course, reg.registrationDate || reg.registeredAt || new Date())
            : reg.expiryDate || new Date(Date.now() + 30 * 86400000)
        });
      } catch (_) {
        enrollment = reg;
      }
    }
  }

  if (enrollment && course) {
    const startedAt = enrollment.enrolledAt || enrollment.registrationDate || enrollment.registeredAt || enrollment.createdAt || new Date();
    const expectedExpiryDate = getCourseExpiryDate(course, startedAt);
    if (!enrollment.expiryDate || new Date(enrollment.expiryDate).getTime() !== expectedExpiryDate.getTime()) {
      enrollment.expiryDate = expectedExpiryDate;
      if (enrollment.save) await enrollment.save();
    }
  }

  return enrollment;
}

function isCourseEnrollmentExpired(enrollment) {
  return Boolean(enrollment && enrollment.expiryDate && new Date(enrollment.expiryDate) <= new Date());
}


// 1. List Courses (with user progress if authenticated)
app.get('/api/courses', asyncRoute(async (req, res) => {
  const query = req.query.all === 'true' ? {} : { status: { $in: ['active', 'published'] } };
  const courses = (await Course.find(query).sort({ createdAt: 1 }))
    .filter(course => getStudentCourseVideoFolder(course));

  const currentUser = await getOptionalUser(req);
  let userEnrollments = [];
  if (currentUser) {
    userEnrollments = await CourseEnrollment.find({
      $or: [{ userId: currentUser._id }, { studentId: currentUser._id }]
    });
  }

  const enrollmentMap = new Map();
  userEnrollments.forEach(en => {
    enrollmentMap.set(String(en.courseId || en.course), en);
  });

  const enriched = courses.map(course => {
    const cObj = attachStudentCourseVideos(course.toObject(), course);
    const en = enrollmentMap.get(String(course._id));
    cObj.isEnrolled = !!en;
    cObj.totalLessons = course.lessons ? course.lessons.length : (course.totalLessons || 10);
    cObj.xp = course.xp || course.xpReward || 500;
    cObj.enrollment = en ? {
      progress: en.progress || 0,
      completedLessons: en.completedLessons || [],
      quizPassed: en.quizPassed || false,
      quizScore: en.quizScore || 0,
      status: en.status || 'registered',
      certificateClaimed: en.certificateClaimed || false,
      certificateEligible: en.certificateEligible || false
    } : null;
    return cObj;
  });

  res.json({ success: true, courses: enriched });
}));

// 2. Course Details
app.get('/api/courses/:id', asyncRoute(async (req, res) => {
  let course = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    course = await Course.findById(req.params.id);
  }
  if (!course) {
    course = await Course.findOne({ slug: req.params.id });
  }
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
  if (!getStudentCourseVideoFolder(course)) return res.status(404).json({ success: false, message: 'Course not found.' });

  const currentUser = await getOptionalUser(req);
  let enrollment = null;
  if (currentUser) {
    enrollment = await findUserEnrollment(currentUser._id, course._id, course);
  }

  const completedSet = new Set((enrollment?.completedLessons || []).map(String));
  const lessons = (course.lessons || []).map((l, idx) => {
    const lObj = l.toObject ? l.toObject() : { ...l };
    const num = lObj.lessonNumber || (idx + 1);
    lObj.lessonNumber = num;
    lObj.isCompleted = completedSet.has(String(num)) || completedSet.has(String(lObj._id));
    // All lessons are available to view; completion remains sequential.
    lObj.isLocked = false;
    return lObj;
  });

  const courseObj = course.toObject();
  courseObj.lessons = lessons;
  attachStudentCourseVideos(courseObj, course);
  courseObj.totalLessons = lessons.length || 10;
  courseObj.xp = course.xp || course.xpReward || 500;

  res.json({
    success: true,
    course: courseObj,
    isEnrolled: !!enrollment,
    enrollment: enrollment ? {
      progress: enrollment.progress || 0,
      completedLessons: enrollment.completedLessons || [],
      quizPassed: enrollment.quizPassed || false,
      quizScore: enrollment.quizScore || 0,
      certificateEligible: enrollment.certificateEligible || false,
      certificateClaimed: enrollment.certificateClaimed || false,
      status: enrollment.status || 'registered',
      expiryDate: enrollment.expiryDate,
      isExpired: isCourseEnrollmentExpired(enrollment)
    } : null
  });
}));

// 3. Register / Enroll in Course
const handleCourseEnroll = asyncRoute(async (req, res) => {
  const courseId = req.params.id || req.body.courseId;
  let course = null;
  if (mongoose.Types.ObjectId.isValid(courseId)) {
    course = await Course.findById(courseId);
  }
  if (!course) {
    course = await Course.findOne({ slug: courseId });
  }
  if (!course) return res.status(404).json({ success: false, message: 'Course not found or inactive.' });
  if (!getStudentCourseVideoFolder(course)) return res.status(404).json({ success: false, message: 'Course not found or inactive.' });

  let enrollment = await findUserEnrollment(req.user._id, course._id, course);

  if (enrollment) {
    if (isCourseEnrollmentExpired(enrollment)) {
      return res.status(403).json({ success: false, message: 'Course access has expired.', courseExpired: true });
    }
    return res.json({
      success: true,
      message: 'You are already registered for this course.',
      alreadyEnrolled: true,
      enrollment
    });
  }

  // Pre-fill / extract participant details gracefully from profile
  const fullName = (req.body.fullName || req.user.fullName || 'Student').trim();
  const userType = (req.body.userType || req.user.userType || 'student').toLowerCase();
  const institution = (req.body.institution || req.body.college || req.user.institution || req.user.college || 'EDUTECH NEXUS Academic Partner').trim();
  const department = (req.body.department || req.user.department || 'Technology & Engineering').trim();
  const year = (req.body.year || req.user.year || '3').trim();
  const registerNumber = (req.body.registerNumber || req.body.studentId || req.user.registerNumber || req.user.studentId || `EN-${Date.now().toString().slice(-6)}`).trim();

  const enrolledAt = new Date();
  const expiryDate = getCourseExpiryDate(course, enrolledAt);
  enrollment = await CourseEnrollment.create({
    userId: req.user._id,
    studentId: req.user._id,
    user: req.user._id,
    courseId: course._id,
    course: course._id,
    fullName,
    age: req.body.age || req.user.age || 20,
    userType,
    institution,
    college: institution,
    department,
    year,
    registerNumber,
    company: req.body.company || req.user.company || '',
    designation: req.body.designation || req.user.designation || '',
    city: req.body.city || req.user.city || 'Chennai',
    state: req.body.state || req.user.state || 'Tamil Nadu',
    enrolledAt,
    registrationDate: enrolledAt,
    registeredAt: enrolledAt,
    expiryDate,
    progress: 0,
    completedLessons: [],
    status: 'registered',
    completed: false,
    quizPassed: false,
    quizScore: 0,
    certificateEligible: false,
    certificateClaimed: false
  });

  // Keep CourseRegistration and User.enrolledCourses in sync
  await CourseRegistration.findOneAndUpdate(
    { user: req.user._id, course: course._id },
    {
      user: req.user._id,
      course: course._id,
      registrationDate: enrolledAt,
      registeredAt: enrolledAt,
      expiryDate,
      progress: 0,
      completedLessons: [],
      status: 'registered'
    },
    { upsert: true }
  ).catch(() => {});

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: course._id } });

  res.status(201).json({
    success: true,
    message: 'Course registration successful! You can now start learning.',
    enrollment
  });
});

app.post('/api/courses/enroll', authenticateUser, handleCourseEnroll);
app.post('/api/courses/:id/enroll', authenticateUser, handleCourseEnroll);
app.post('/api/courses/:id/register', authenticateUser, handleCourseEnroll);

// 4. My Enrolled Courses
const handleMyCourses = asyncRoute(async (req, res) => {
  const registrations = await CourseEnrollment.find({
    $or: [{ userId: req.user._id }, { studentId: req.user._id }]
  })
    .populate('courseId')
    .populate('course')
    .sort({ createdAt: -1 });

  res.json({ success: true, registrations, myCourses: registrations });
});

app.get('/api/courses/my-courses', authenticateUser, handleMyCourses);
app.get('/api/courses/registrations/me', authenticateUser, handleMyCourses);

// 5. Get Course Lessons (with Lock System)
app.get('/api/courses/:courseId/lessons', authenticateUser, asyncRoute(async (req, res) => {
  const courseId = req.params.courseId || req.params.id;
  const course = await findCourseByIdOrSlug(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
  if (!getStudentCourseVideoFolder(course)) return res.status(404).json({ success: false, message: 'Course not found.' });

  const enrollment = await findUserEnrollment(req.user._id, course._id, course);

  if (!enrollment) {
    return res.status(403).json({
      success: false,
      message: 'Please register for this course to access lessons.',
      requiresRegistration: true
    });
  }
  if (isCourseEnrollmentExpired(enrollment)) {
    return res.status(403).json({ success: false, message: 'Course access has expired.', courseExpired: true });
  }

  const completedSet = new Set((enrollment.completedLessons || []).map(String));
  const lessons = (course.lessons || []).map((l, idx) => {
    const lObj = l.toObject ? l.toObject() : { ...l };
    const num = lObj.lessonNumber || (idx + 1);
    lObj.lessonNumber = num;
    lObj.isCompleted = completedSet.has(String(num)) || completedSet.has(String(lObj._id));
    lObj.isLocked = false;
    return lObj;
  });
  const resolvedLessons = attachStudentCourseVideos({ lessons }, course).lessons;

  res.json({
    success: true,
    courseId: course._id,
    courseTitle: course.title,
    instructor: course.instructor,
    duration: course.duration,
    totalLessons: resolvedLessons.length,
    lessons: resolvedLessons,
    enrollment: {
      progress: enrollment.progress || 0,
      completedLessons: enrollment.completedLessons || [],
      quizPassed: enrollment.quizPassed || false,
      quizScore: enrollment.quizScore || 0,
      certificateEligible: enrollment.certificateEligible || false,
      certificateClaimed: enrollment.certificateClaimed || false,
      status: enrollment.status || 'registered',
      expiryDate: enrollment.expiryDate
    }
  });
}));

// 6. Get Single Lesson Details
app.get('/api/courses/:courseId/lessons/:lessonId', authenticateUser, asyncRoute(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const course = await findCourseByIdOrSlug(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
  if (!getStudentCourseVideoFolder(course)) return res.status(404).json({ success: false, message: 'Course not found.' });

  const enrollment = await findUserEnrollment(req.user._id, course._id, course);

  if (!enrollment) {
    return res.status(403).json({ success: false, message: 'Please register for this course first.', requiresRegistration: true });
  }
  if (isCourseEnrollmentExpired(enrollment)) {
    return res.status(403).json({ success: false, message: 'Course access has expired.', courseExpired: true });
  }

  // Find lesson by _id or lessonNumber
  let lesson = null;
  let lessonIndex = -1;
  for (let i = 0; i < course.lessons.length; i++) {
    const l = course.lessons[i];
    if (String(l._id) === lessonId || String(l.lessonNumber) === lessonId || String(i + 1) === lessonId) {
      lesson = l;
      lessonIndex = i;
      break;
    }
  }

  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found in course.' });

  const lessonObj = lesson.toObject ? lesson.toObject() : { ...lesson };
  const completedSet = new Set((enrollment.completedLessons || []).map(String));
  lessonObj.lessonNumber = lessonObj.lessonNumber || (lessonIndex + 1);
  lessonObj.isCompleted = completedSet.has(String(lessonObj.lessonNumber)) || completedSet.has(String(lesson._id));
  const resolvedLesson = attachStudentCourseVideos({ lessons: [lessonObj] }, course).lessons[0];

  res.json({
    success: true,
    courseId: course._id,
    courseTitle: course.title,
    lesson: resolvedLesson,
    totalLessons: course.lessons.length,
    hasNext: lessonIndex < course.lessons.length - 1,
    hasPrev: lessonIndex > 0
  });
}));

// 7. Complete a Lesson (Sequential Check + Award 50 XP + Update Progress)
const handleLessonComplete = asyncRoute(async (req, res) => {
  const courseId = req.params.courseId || req.params.id;
  const lessonParam = req.params.lessonId || req.body.lessonId || req.body.lessonNumber || '1';

  const course = await findCourseByIdOrSlug(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  let enrollment = await findUserEnrollment(req.user._id, course._id, course);

  if (!enrollment) return res.status(403).json({ success: false, message: 'You must register for this course first.' });
  if (isCourseEnrollmentExpired(enrollment)) {
    return res.status(403).json({ success: false, message: 'Course access has expired.', courseExpired: true });
  }


  // Locate the target lesson and its index
  let targetLesson = null;
  let targetIndex = -1;
  for (let i = 0; i < course.lessons.length; i++) {
    const l = course.lessons[i];
    if (String(l._id) === String(lessonParam) || String(l.lessonNumber) === String(lessonParam) || String(i + 1) === String(lessonParam)) {
      targetLesson = l;
      targetIndex = i;
      break;
    }
  }

  if (!targetLesson) {
    return res.status(404).json({ success: false, message: 'Lesson not found in course.' });
  }

  const targetLessonNum = targetLesson.lessonNumber || (targetIndex + 1);
  const targetKey = String(targetLessonNum);

  // Sequential rule enforcement: If lesson > 1, verify lesson - 1 is completed
  const completedList = (enrollment.completedLessons || []).map(String);
  if (targetIndex > 0) {
    const prevKey = String(targetIndex);
    if (!completedList.includes(prevKey)) {
      return res.status(400).json({
        success: false,
        message: 'Complete the previous lesson to continue.'
      });
    }
  }

  const alreadyCompleted = completedList.includes(targetKey);
  let xpAwarded = 0;

  if (!alreadyCompleted) {
    enrollment.completedLessons.push(targetKey);

    // Award 50 XP per lesson (Requirement 14 & 26)
    const xpResult = await awardXP(
      req.user._id,
      50,
      `Completed Lesson ${targetLessonNum}: ${targetLesson.title} in ${course.title}`,
      { source: 'course', courseId: course._id, lessonId: targetKey }
    );
    if (xpResult) xpAwarded = 50;

    // Record in LessonProgress collection
    await LessonProgress.findOneAndUpdate(
      {
        userId: req.user._id,
        courseId: course._id,
        lessonId: targetKey
      },
      {
        userId: req.user._id,
        studentId: req.user._id,
        courseId: course._id,
        lessonId: targetKey,
        completed: true,
        completedAt: new Date(),
        xpAwarded: 50
      },
      { upsert: true }
    ).catch(() => {});
  }

  const totalLessons = Math.max(1, course.lessons.length);
  const uniqueCompleted = [...new Set(enrollment.completedLessons.map(String))];
  const progressPercent = Math.min(100, Math.round((uniqueCompleted.length / totalLessons) * 100));
  enrollment.progress = progressPercent;

  const allLessonsCompleted = uniqueCompleted.length >= totalLessons;
  if (allLessonsCompleted) {
    enrollment.status = enrollment.quizPassed ? 'completed' : 'in_progress';
  } else {
    enrollment.status = 'in_progress';
  }

  enrollment.certificateEligible = (progressPercent >= 90) || allLessonsCompleted;

  await enrollment.save();

  // Sync CourseRegistration
  await CourseRegistration.findOneAndUpdate(
    { user: req.user._id, course: course._id },
    {
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      status: enrollment.status,
      certificateEligible: enrollment.certificateEligible
    }
  ).catch(() => {});

  res.json({
    success: true,
    message: alreadyCompleted ? 'Lesson already completed.' : `Lesson ${targetLessonNum} completed! +50 XP earned.`,
    alreadyCompleted,
    progress: enrollment.progress,
    completedLessons: enrollment.completedLessons,
    allLessonsCompleted,
    certificateEligible: enrollment.certificateEligible,
    nextLessonNumber: targetIndex + 2 <= totalLessons ? targetIndex + 2 : null,
    xpAwarded,
    enrollment: {
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      quizPassed: enrollment.quizPassed || false,
      certificateEligible: enrollment.certificateEligible || false
    }
  });
});

app.post('/api/courses/:courseId/lessons/:lessonId/complete', authenticateUser, handleLessonComplete);
app.put('/api/courses/:id/progress', authenticateUser, handleLessonComplete);

// 8. Get Course Progress
app.get('/api/courses/:id/progress', authenticateUser, asyncRoute(async (req, res) => {
  const course = await findCourseByIdOrSlug(req.params.id);
  const targetCourseId = course ? course._id : req.params.id;
  const enrollment = await findUserEnrollment(req.user._id, targetCourseId, course);

  if (!enrollment) {
    return res.json({
      success: true,
      registered: false,
      progress: 0,
      completedLessons: [],
      quizPassed: false,
      certificateEligible: false,
      certificateClaimed: false
    });
  }
  if (isCourseEnrollmentExpired(enrollment)) {
    return res.status(403).json({ success: false, message: 'Course access has expired.', courseExpired: true });
  }

  const totalLessons = enrollment.totalLessons || 10;
  const completedCount = (enrollment.completedLessons || []).length;
  const allLessonsCompleted = completedCount >= totalLessons || (enrollment.progress || 0) >= 100;

  res.json({
    success: true,
    registered: true,
    progress: enrollment.progress || 0,
    completedLessons: enrollment.completedLessons || [],
    completedLessonsCount: completedCount,
    totalLessons,
    allLessonsCompleted,
    quizScore: enrollment.quizScore || 0,
    quizPassed: enrollment.quizPassed || false,
    certificateEligible: enrollment.certificateEligible || false,
    certificateClaimed: enrollment.certificateClaimed || false,
    status: enrollment.status || 'registered'
  });
}));

// ==========================================
// 6. QUIZ & CERTIFICATE ROUTES
// ==========================================

// 1. Get Course Final Quiz (Questions sanitized to hide correct answers)
app.get('/api/courses/:courseId/quiz', authenticateUser, asyncRoute(async (req, res) => {
  const { courseId } = req.params;
  const course = await findCourseByIdOrSlug(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
  if (!getStudentCourseVideoFolder(course)) return res.status(404).json({ success: false, message: 'Course not found.' });

  const enrollment = await findUserEnrollment(req.user._id, course._id, course);

  if (!enrollment) {
    return res.status(403).json({ success: false, message: 'Please register for this course first.' });
  }
  if (isCourseEnrollmentExpired(enrollment)) {
    return res.status(403).json({ success: false, message: 'Course access has expired.', courseExpired: true });
  }

  const totalLessons = course.lessons ? course.lessons.length : 10;
  const completedCount = enrollment.completedLessons ? enrollment.completedLessons.length : 0;
  if (completedCount < totalLessons) {
    return res.status(403).json({
      success: false,
      message: `Complete all ${totalLessons} lessons before taking the final quiz. (${completedCount}/${totalLessons} completed)`,
      completedCount,
      totalLessons
    });
  }

  let quiz = await Quiz.findOne({ courseId: course._id });
  if (!quiz) {
    // Fallback: look up in seed data
    const coursesData = require('./seed/coursesData');
    const match = Array.isArray(coursesData) ? coursesData.find(c => c.title.toLowerCase() === course.title.toLowerCase()) : null;
    if (match && match.quiz) {
      quiz = await Quiz.create({
        courseId: course._id,
        title: match.quiz.title,
        passPercentage: match.quiz.passPercentage || 70,
        questions: match.quiz.questions
      });
    }
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return res.status(404).json({ success: false, message: 'Quiz not yet configured for this course.' });
  }

  // Sanitize questions so correctAnswer is NOT leaked to client
  const sanitizedQuestions = quiz.questions.map(q => ({
    questionNumber: q.questionNumber,
    question: q.question || q.questionText,
    questionText: q.questionText || q.question,
    options: q.options
  }));

  const previousAttempts = await QuizAttempt.find({
    $or: [{ userId: req.user._id }, { studentId: req.user._id }],
    courseId: course._id
  }).sort({ createdAt: -1 }).limit(5);

  const quizPayload = {
    title: quiz.title,
    passPercentage: quiz.passPercentage || 70,
    questions: sanitizedQuestions
  };

  res.json({
    success: true,
    courseTitle: course.title,
    courseId: course._id,
    quizTitle: quiz.title,
    passPercentage: quiz.passPercentage || 70,
    totalQuestions: sanitizedQuestions.length,
    questions: sanitizedQuestions,
    quiz: quizPayload,
    bestScore: enrollment.quizScore || 0,
    quizPassed: enrollment.quizPassed || false,
    previousAttempts
  });
}));

// 2. Submit Course Final Quiz
app.post('/api/courses/:courseId/quiz/submit', authenticateUser, asyncRoute(async (req, res) => {
  const { courseId } = req.params;
  const rawAnswers = req.body.answers;
  if (!rawAnswers || (typeof rawAnswers !== 'object' && !Array.isArray(rawAnswers))) {
    return res.status(400).json({ success: false, message: 'Answers array or map is required.' });
  }

  const course = await findCourseByIdOrSlug(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  const enrollment = await findUserEnrollment(req.user._id, course._id, course);

  if (!enrollment) return res.status(403).json({ success: false, message: 'Not enrolled in this course.' });
  if (isCourseEnrollmentExpired(enrollment)) {
    return res.status(403).json({ success: false, message: 'Course access has expired.', courseExpired: true });
  }

  const quiz = await Quiz.findOne({ courseId: course._id });
  if (!quiz || !quiz.questions.length) {
    return res.status(404).json({ success: false, message: 'Quiz questions not found.' });
  }

  let correctCount = 0;
  const totalQuestions = quiz.questions.length;
  const detailedResults = [];
  const storedAnswers = [];

  quiz.questions.forEach((q, idx) => {
    let studentAns = -1;

    // Check object key by question ID or index
    if (!Array.isArray(rawAnswers) && typeof rawAnswers === 'object') {
      const qIdStr = q._id ? q._id.toString() : '';
      if (rawAnswers[qIdStr] !== undefined) {
        studentAns = Number(rawAnswers[qIdStr]);
      } else if (rawAnswers[idx] !== undefined) {
        studentAns = Number(rawAnswers[idx]);
      } else if (rawAnswers[String(idx)] !== undefined) {
        studentAns = Number(rawAnswers[String(idx)]);
      }
    } else if (Array.isArray(rawAnswers)) {
      // Check array items
      const item = rawAnswers[idx] !== undefined ? rawAnswers[idx] : rawAnswers.find(a => a && (a.questionIndex === idx || (a.questionId && q._id && a.questionId.toString() === q._id.toString())));
      if (typeof item === 'object' && item !== null && item.selectedOption !== undefined) {
        studentAns = Number(item.selectedOption);
      } else if (item !== undefined && item !== null && typeof item !== 'object') {
        studentAns = Number(item);
      }
    }

    storedAnswers.push(studentAns);
    const isCorrect = studentAns === q.correctAnswer;
    if (isCorrect) correctCount++;
    detailedResults.push({
      questionNumber: q.questionNumber || (idx + 1),
      userAnswer: studentAns,
      correctAnswer: q.correctAnswer,
      isCorrect,
      explanation: q.explanation
    });
  });

  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const passRequirement = quiz.passPercentage || 70;
  const passed = percentage >= passRequirement;

  // Save QuizAttempt
  await QuizAttempt.create({
    userId: req.user._id,
    studentId: req.user._id,
    courseId: course._id,
    score: correctCount,
    totalQuestions,
    percentage,
    passed,
    answers: storedAnswers
  });

  // Update best quiz score in enrollment
  enrollment.quizScore = Math.max(enrollment.quizScore || 0, percentage);

  let xpAwarded = 0;
  if (passed) {
    enrollment.quizPassed = true;
    enrollment.status = 'completed';
    enrollment.completed = true;
    if (!enrollment.completedAt) enrollment.completedAt = new Date();
    enrollment.certificateEligible = true;

    // Check if user already got Quiz XP for this course
    const existingXP = await XPTransaction.findOne({
      $or: [{ userId: req.user._id }, { studentId: req.user._id }],
      action: 'quiz_pass',
      referenceId: String(course._id)
    });

    if (!existingXP) {
      await awardXP(
        req.user._id,
        100,
        `Passed final quiz for ${course.title} with ${percentage}% score`,
        { source: 'quiz', courseId: course._id, referenceId: String(course._id) }
      );
      xpAwarded = 100;
    }
  }

  await enrollment.save();

  // Sync CourseRegistration
  await CourseRegistration.findOneAndUpdate(
    { user: req.user._id, course: course._id },
    {
      quizPassed: enrollment.quizPassed,
      quizScore: enrollment.quizScore,
      completed: enrollment.completed,
      certificateEligible: enrollment.certificateEligible
    }
  ).catch(() => {});

  res.json({
    success: true,
    score: correctCount,
    totalQuestions,
    percentage,
    passed,
    passPercentage: passRequirement,
    bestScore: enrollment.quizScore,
    xpAwarded,
    courseCompleted: passed,
    canClaimCertificate: passed,
    detailedResults,
    message: passed
      ? `Congratulations! You passed the quiz with ${percentage}% (${correctCount}/${totalQuestions})!`
      : `You scored ${percentage}%. You need ${passRequirement}% or above to complete the course.`
  });
}));

// 3. Claim Certificate (Requires Lessons Completed + Quiz Passed >= 70%)
app.post('/api/certificates/claim', authenticateUser, asyncRoute(async (req, res) => {
  const courseId = req.body.courseId || req.params.id;
  if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required to claim certificate.' });

  const course = await findCourseByIdOrSlug(courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  const enrollment = await findUserEnrollment(req.user._id, course._id, course);

  if (!enrollment) return res.status(404).json({ success: false, message: 'You have not registered for this course.' });
  if (isCourseEnrollmentExpired(enrollment)) {
    return res.status(403).json({ success: false, message: 'Course access has expired.', courseExpired: true });
  }

  const totalLessons = course.lessons ? course.lessons.length : 10;
  const completedLessons = enrollment.completedLessons ? enrollment.completedLessons.length : 0;
  if (completedLessons < totalLessons) {
    return res.status(400).json({
      success: false,
      message: `Complete all ${totalLessons} lessons before claiming your certificate. (${completedLessons}/${totalLessons} done)`
    });
  }

  const courseQuiz = await Quiz.findOne({ courseId: course._id });
  if (courseQuiz && !enrollment.quizPassed && (enrollment.quizScore || 0) < 70) {
    return res.status(400).json({
      success: false,
      message: 'You must pass the final course quiz (70% or higher) before claiming your certificate.'
    });
  }

  // Return existing certificate if already claimed
  let existingCert = await Certificate.findOne(getEnrollmentFilter(req.user._id, course._id));

  if (existingCert) {
    return res.json({
      success: true,
      message: 'Your certificate is already generated.',
      alreadyClaimed: true,
      certificate: existingCert
    });
  }

  // Generate unique Certificate ID (e.g. EN-CERT-2026-A8F39K)
  const uniqueCode = crypto.randomBytes(3).toString('hex').toUpperCase();
  const certId = `EN-CERT-2026-${uniqueCode}`;

  const certificate = await Certificate.create({
    certificateId: certId,
    userId: req.user._id,
    studentId: req.user._id,
    user: req.user._id,
    studentName: req.user.fullName,
    studentDepartment: req.user.department || enrollment.department || 'Technology & Engineering',
    studentCollege: req.user.college || req.user.institution || enrollment.institution || 'EDUTECH NEXUS Academic Partner',
    courseId: course._id,
    course: course._id,
    courseName: course.title,
    completionDate: enrollment.completedAt || new Date(),
    issueDate: new Date(),
    quizScore: enrollment.quizScore || 80,
    xp: 200,
    xpAwarded: 200,
    awardedXP: 200,
    verificationId: certId,
    verificationUrl: `/verify-certificate.html?id=${certId}`,
    status: 'active'
  });

  enrollment.certificateClaimed = true;
  enrollment.certificate = certificate._id;
  enrollment.certificateEligible = true;
  await enrollment.save();

  await CourseRegistration.findOneAndUpdate(
    { user: req.user._id, course: course._id },
    { certificateClaimed: true, certificate: certificate._id }
  ).catch(() => {});

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { certificates: certificate._id } });

  // Award 200 XP for certificate claim (Requirement 26)
  await awardXP(
    req.user._id,
    200,
    `Claimed Official Certificate of Completion for ${course.title}`,
    { source: 'certificate', referenceId: certId }
  );

  await Notification.create({
    user: req.user._id,
    title: 'Certificate Issued! 🎓',
    message: `Your verified certificate for "${course.title}" (ID: ${certId}) is ready.`,
    type: 'certificate',
    link: `certificate.html?id=${certificate._id}`
  }).catch(() => {});

  res.status(201).json({
    success: true,
    message: 'Congratulations! Professional certificate generated and +200 XP awarded!',
    certificate
  });
}));

// 4. My Certificates & Eligible to Claim List
app.get('/api/certificates/my', authenticateUser, asyncRoute(async (req, res) => {
  const [issued, eligibleEnrollments] = await Promise.all([
    Certificate.find({
      $or: [{ userId: req.user._id }, { studentId: req.user._id }],
      status: 'active'
    }).populate('courseId', 'title category thumbnail duration image xp').populate('course', 'title category thumbnail duration image xp').sort({ createdAt: -1 }),

    CourseEnrollment.find({
      $or: [{ userId: req.user._id }, { studentId: req.user._id }],
      quizPassed: true,
      certificateClaimed: { $ne: true }
    }).populate('courseId', 'title category thumbnail duration image xp').populate('course', 'title category thumbnail duration image xp')
  ]);

  res.json({
    success: true,
    certificates: issued,
    eligibleToClaim: eligibleEnrollments
  });
}));

app.get('/api/certificates', authenticateUser, asyncRoute(async (req, res) => {
  const list = await Certificate.find({
    $or: [{ userId: req.user._id }, { studentId: req.user._id }],
    status: 'active'
  }).populate('course', 'title category thumbnail').sort({ createdAt: -1 });

  res.json({ success: true, certificates: list });
}));

// 5. Get Certificate by ID
app.get('/api/certificates/:id', authenticateUser, asyncRoute(async (req, res) => {
  const param = req.params.id.trim();
  let certificate = null;
  if (mongoose.Types.ObjectId.isValid(param)) {
    certificate = await Certificate.findById(param).populate('course');
  }
  if (!certificate) {
    certificate = await Certificate.findOne({ certificateId: param.toUpperCase() }).populate('course');
  }
  if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found.' });

  res.json({ success: true, certificate });
}));

// 6. Public Certificate Verification Portal
const handleVerifyCertificate = asyncRoute(async (req, res) => {
  const rawId = (req.params.id || req.params.certificateId || '').trim().toUpperCase();
  if (!rawId) return res.status(400).json({ success: false, message: 'Certificate ID is required.' });

  const certificate = await Certificate.findOne({
    certificateId: rawId,
    status: 'active'
  }).populate('course', 'title category image');

  if (!certificate) {
    return res.status(404).json({
      success: false,
      valid: false,
      verified: false,
      message: 'Certificate verification failed: Certificate ID not found or invalid.'
    });
  }

  res.json({
    success: true,
    valid: true,
    verified: true,
    certificateId: certificate.certificateId,
    studentName: certificate.studentName,
    courseName: certificate.courseName,
    completionDate: certificate.completionDate || certificate.issueDate,
    quizScore: certificate.quizScore || 80,
    xp: certificate.xp || 200,
    status: certificate.status,
    certificate
  });
});

app.get('/api/certificates/verify/:id', handleVerifyCertificate);
app.get('/api/certificates/verify/:certificateId', handleVerifyCertificate);

// ==========================================
// 7. INTERNSHIP & COMPANY ROUTES
// ==========================================
app.get('/api/companies', asyncRoute(async (req, res) => {
  const companies = await Company.find().sort({ name: 1 });
  res.json({ success: true, companies });
}));

app.get('/api/companies/:id', asyncRoute(async (req, res) => {
  let company = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    company = await Company.findById(req.params.id);
  }
  if (!company) {
    company = await Company.findOne({ name: new RegExp(`^${req.params.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') });
  }
  if (!company) return res.status(404).json({ success: false, message: 'Company record not found.' });

  // Find internships associated with this company
  const internships = await Internship.find({
    $or: [{ companyId: company._id }, { company: company.name }],
    status: 'active'
  }).sort({ createdAt: -1 });

  // Find supporting company documents (PDFs)
  const documents = await CompanyDocument.find({
    companyId: company._id,
    status: 'active'
  }).sort({ createdAt: -1 });

  res.json({ success: true, company, internships, documents });
}));

app.get('/api/internships', authenticateOptionalUser, asyncRoute(async (req, res) => {
  const {
    search,
    domain,
    category,
    workMode,
    type,
    duration,
    skills,
    sort,
    verifiedOnly
  } = req.query;

  const filter = {};
  if (req.query.all !== 'true') {
    filter.status = 'active';
  }

  // Domain / Category filter
  const targetCategory = domain || category;
  if (targetCategory && targetCategory !== 'All') {
    filter.category = new RegExp(targetCategory.trim(), 'i');
  }

  // Work Mode filter
  if (workMode && workMode !== 'All') {
    filter.workMode = workMode;
  }

  // Type (Free / Paid)
  if (type && type !== 'All') {
    filter.type = type;
  }

  // Duration
  if (duration && duration !== 'All') {
    filter.duration = new RegExp(duration.trim(), 'i');
  }

  // Verified Only
  if (verifiedOnly === 'true') {
    filter.isVerified = true;
  }

  // Skills filter
  if (skills) {
    const skillList = Array.isArray(skills) ? skills : String(skills).split(',').map(s => s.trim()).filter(Boolean);
    if (skillList.length > 0) {
      filter.skills = { $in: skillList.map(s => new RegExp(s, 'i')) };
    }
  }

  // Search filter
  if (search && search.trim()) {
    const sTerm = search.trim();
    filter.$or = [
      { title: new RegExp(sTerm, 'i') },
      { company: new RegExp(sTerm, 'i') },
      { description: new RegExp(sTerm, 'i') },
      { skills: { $in: [new RegExp(sTerm, 'i')] } },
      { location: new RegExp(sTerm, 'i') }
    ];
  }

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === 'closingSoon') {
    sortOption = { deadline: 1 };
  } else if (sort === 'newest') {
    sortOption = { createdAt: -1 };
  } else if (sort === 'title') {
    sortOption = { title: 1 };
  }

  const internships = await Internship.find(filter).populate('companyId').sort(sortOption).lean();

  // If user is logged in, lookup their bookmarks and applications
  let bookmarkedIds = new Set();
  let applicationMap = new Map();

  if (req.user) {
    const bookmarks = await InternshipBookmark.find({ studentId: req.user._id }).select('internshipId');
    bookmarks.forEach(b => bookmarkedIds.add(b.internshipId.toString()));

    const apps = await InternshipApplication.find({
      $or: [{ studentId: req.user._id }, { user: req.user._id }]
    }).select('internshipId status applicationId');
    apps.forEach(a => {
      if (a.internshipId) applicationMap.set(a.internshipId.toString(), a);
    });
  }

  const now = new Date();
  const enriched = internships.map(item => {
    const isExpired = item.deadline ? new Date(item.deadline) < now : false;
    const daysLeft = item.deadline ? Math.max(0, Math.ceil((new Date(item.deadline) - now) / (1000 * 60 * 60 * 24))) : 30;
    const userApp = applicationMap.get(item._id.toString());

    return {
      ...item,
      isExpired,
      daysLeft,
      isBookmarked: bookmarkedIds.has(item._id.toString()),
      hasApplied: !!userApp,
      applicationStatus: userApp ? userApp.status : null,
      applicationId: userApp ? userApp.applicationId : null
    };
  });

  // Extract distinct domains / categories for filter dropdown
  const distinctCategories = await Internship.distinct('category', { status: 'active' });

  res.json({
    success: true,
    total: enriched.length,
    internships: enriched,
    categories: distinctCategories.filter(Boolean)
  });
}));

// Bookmarks Endpoints
app.get('/api/internships/bookmarks/me', authenticateUser, asyncRoute(async (req, res) => {
  const bookmarks = await InternshipBookmark.find({ studentId: req.user._id })
    .populate({
      path: 'internshipId',
      populate: { path: 'companyId' }
    })
    .sort({ createdAt: -1 });

  const activeBookmarks = bookmarks
    .filter(b => b.internshipId)
    .map(b => b.internshipId);

  res.json({ success: true, count: activeBookmarks.length, bookmarks: activeBookmarks });
}));

app.post('/api/internships/:id/bookmark', authenticateUser, asyncRoute(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

  const existing = await InternshipBookmark.findOne({
    studentId: req.user._id,
    internshipId: internship._id
  });

  if (existing) {
    await InternshipBookmark.findByIdAndDelete(existing._id);
    await Internship.findByIdAndUpdate(internship._id, { $pull: { bookmarkedBy: req.user._id } });
    return res.json({ success: true, bookmarked: false, message: 'Removed from saved opportunities' });
  } else {
    await InternshipBookmark.create({
      studentId: req.user._id,
      internshipId: internship._id
    });
    await Internship.findByIdAndUpdate(internship._id, { $addToSet: { bookmarkedBy: req.user._id } });
    return res.json({ success: true, bookmarked: true, message: 'Saved to your career opportunities' });
  }
}));

app.get('/api/internships/my-applications', authenticateUser, asyncRoute(async (req, res) => {
  const applications = await InternshipApplication.find({
    $or: [{ studentId: req.user._id }, { user: req.user._id }]
  })
    .populate('internshipId')
    .populate('internship')
    .sort({ createdAt: -1 });

  res.json({ success: true, applications, registrations: applications });
}));

app.get('/api/internships/registrations/me', authenticateUser, asyncRoute(async (req, res) => {
  const applications = await InternshipApplication.find({
    $or: [{ studentId: req.user._id }, { user: req.user._id }]
  })
    .populate('internshipId')
    .populate('internship')
    .sort({ createdAt: -1 });

  res.json({ success: true, registrations: applications });
}));

app.get('/api/internships/:id', authenticateOptionalUser, asyncRoute(async (req, res) => {
  if (req.params.id === 'my-applications' || req.params.id === 'registrations' || req.params.id === 'bookmarks') {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ success: false, message: 'Invalid internship ID format' });
  }

  const internship = await Internship.findById(req.params.id).populate('companyId');
  if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' });

  let company = null;
  if (internship.companyId) {
    company = internship.companyId;
  } else {
    company = await Company.findOne({ name: internship.company });
  }

  let isBookmarked = false;
  let hasApplied = false;
  let userApplication = null;

  if (req.user) {
    const bm = await InternshipBookmark.findOne({ studentId: req.user._id, internshipId: internship._id });
    isBookmarked = !!bm;

    userApplication = await InternshipApplication.findOne({
      $or: [{ studentId: req.user._id }, { user: req.user._id }],
      internshipId: internship._id
    });
    hasApplied = !!userApplication;
  }

  const now = new Date();
  const isExpired = internship.deadline ? new Date(internship.deadline) < now : false;
  const daysLeft = internship.deadline ? Math.max(0, Math.ceil((new Date(internship.deadline) - now) / (1000 * 60 * 60 * 24))) : 30;

  // Skill-gap integration: find related courses and Playzone games matching skills
  const skills = Array.isArray(internship.skills) ? internship.skills : [];
  const relatedCourses = await Course.find({
    status: 'active',
    $or: [
      { category: internship.category },
      { tags: { $in: skills.map(s => new RegExp(s, 'i')) } },
      { title: { $in: skills.map(s => new RegExp(s, 'i')) } }
    ]
  }).select('title category thumbnail xp duration level').limit(3);

  const relatedGames = await Game.find({
    status: 'active',
    $or: [
      { tags: { $in: skills.map(s => new RegExp(s, 'i')) } },
      { category: new RegExp(internship.category, 'i') },
      { gameType: 'code-sprint' }
    ]
  }).select('title gameType icon color difficulty xpReward').limit(2);

  res.json({
    success: true,
    internship: {
      ...internship.toObject(),
      isExpired,
      daysLeft,
      isBookmarked,
      hasApplied,
      applicationStatus: userApplication ? userApplication.status : null,
      applicationId: userApplication ? userApplication.applicationId : null
    },
    company,
    relatedCourses,
    relatedGames
  });
}));

// Apply / Register for Internship
const handleInternshipApply = asyncRoute(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' });

  const existing = await InternshipApplication.findOne({
    $and: [
      { $or: [{ studentId: req.user._id }, { user: req.user._id }] },
      { $or: [{ internshipId: internship._id }, { internship: internship._id }] }
    ]
  }) || await InternshipRegistration.findOne({
    $and: [
      { $or: [{ studentId: req.user._id }, { user: req.user._id }] },
      { $or: [{ internshipId: internship._id }, { internship: internship._id }] }
    ]
  });

  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'You have already applied for this internship.',
      applicationId: existing.applicationId
    });
  }

  // Parse application fields with fallback to user profile
  const fullName = (req.body.fullName || req.user.fullName || '').trim();
  const email = (req.body.email || req.user.email || '').trim().toLowerCase();
  const phone = (req.body.phone || req.user.phone || '').trim();
  const age = req.body.age ? Number(req.body.age) : (req.user.age || undefined);
  const userType = (req.body.userType || req.user.userType || 'student').toLowerCase();
  const department = (req.body.department || req.user.department || '').trim();
  const institution = (req.body.institution || req.body.college || req.user.institution || req.user.college || '').trim();
  const year = (req.body.year || req.user.year || '').trim();
  const registerNumber = (req.body.registerNumber || req.body.studentId || req.user.registerNumber || req.user.studentId || '').trim();
  const company = (req.body.company || req.user.company || '').trim();
  const jobRole = (req.body.jobRole || req.body.designation || req.user.designation || '').trim();
  const place = (req.body.place || req.body.city || req.user.city || '').trim();
  const city = (req.body.city || req.user.city || '').trim();
  const state = (req.body.state || req.user.state || 'Tamil Nadu').trim();
  const address = (req.body.address || req.user.address || '').trim();
  const experience = (req.body.experience || '').trim();
  const resumeUrl = req.body.resumeUrl || '';
  const resumeName = req.body.resumeName || 'Resume.pdf';
  const githubUrl = (req.body.githubUrl || req.body.github || req.user.github || '').trim();
  const linkedinUrl = (req.body.linkedinUrl || req.body.linkedin || req.user.linkedin || '').trim();
  const portfolioUrl = (req.body.portfolioUrl || req.body.portfolio || req.user.portfolio || '').trim();
  const coverLetter = (req.body.coverLetter || req.body.coverNote || '').trim();

  // Validate required inputs
  if (!fullName) return res.status(400).json({ success: false, message: 'Full name is required.' });
  if (!email) return res.status(400).json({ success: false, message: 'Email address is required.' });
  if (!phone) return res.status(400).json({ success: false, message: 'Phone number is required.' });

  // Validate PDF resume if provided as base64 or URL
  if (resumeUrl) {
    const isBase64Pdf = resumeUrl.startsWith('data:application/pdf');
    const isPdfUrl = /\.pdf(\?.*)?$/i.test(resumeUrl);
    if (!isBase64Pdf && !isPdfUrl && !resumeName.toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ success: false, message: 'Invalid resume file type. Only PDF documents are permitted.' });
    }
    // Check reasonable size limit (~10MB max base64)
    if (resumeUrl.length > 15 * 1024 * 1024) {
      return res.status(400).json({ success: false, message: 'Resume file size exceeds the 10MB limit.' });
    }
  }

  // Generate sequential Application ID: EN-INT-2026-0001
  const appCount = await InternshipApplication.countDocuments();
  const applicationId = `EN-INT-2026-${String(appCount + 1).padStart(4, '0')}`;

  const skillsArray = Array.isArray(req.body.skills)
    ? req.body.skills
    : String(req.body.skills || '').split(',').map(s => s.trim()).filter(Boolean);

  const application = await InternshipApplication.create({
    applicationId,
    studentId: req.user._id,
    user: req.user._id,
    internshipId: internship._id,
    internship: internship._id,
    fullName,
    age,
    email,
    phone,
    userType,
    department,
    institution,
    college: institution,
    year,
    registerNumber,
    company,
    jobRole,
    place,
    city,
    state,
    address,
    skills: skillsArray,
    experience,
    resumeUrl,
    resumeName,
    githubUrl,
    linkedinUrl,
    portfolioUrl,
    coverLetter,
    status: 'Applied',
    appliedAt: new Date()
  });

  // Keep InternshipRegistration in sync
  await InternshipRegistration.findOneAndUpdate(
    { studentId: req.user._id, internshipId: internship._id },
    {
      studentId: req.user._id,
      user: req.user._id,
      internshipId: internship._id,
      internship: internship._id,
      applicationDate: new Date(),
      status: 'Applied',
      coverNote: coverLetter,
      resumeUrl: resumeUrl
    },
    { upsert: true }
  );

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { internships: internship._id } });

  // Build WhatsApp Contact Action link
  const rawWhatsApp = (process.env.WHATSAPP_CONTACT || '8110805533').replace(/[^0-9]/g, '');
  const whatsappMsg = encodeURIComponent(`Hello, I have submitted an internship application with ID: ${applicationId} for the role "${internship.title}" at ${internship.company}.`);
  const whatsappUrl = `https://wa.me/${rawWhatsApp}?text=${whatsappMsg}`;

  // Dispatch Email Notification to configured admin contact
  sendInternshipNotificationEmail({
    applicationId,
    fullName,
    email,
    phone,
    college: institution,
    department,
    internshipTitle: internship.title,
    companyName: internship.company
  }).catch(err => console.error('[EMAIL NOTIFICATION WARNING]', err.message));

  res.status(201).json({
    success: true,
    message: 'Your application has been submitted successfully. Please wait for a response.',
    applicationId,
    status: 'Pending / Under Review',
    whatsappUrl,
    application
  });
});

app.post('/api/internships/:id/apply', authenticateUser, handleInternshipApply);
app.post('/api/internships/:id/register', authenticateUser, handleInternshipApply);

// Withdraw Application
app.put('/api/internships/applications/:id/withdraw', authenticateUser, asyncRoute(async (req, res) => {
  const appId = req.params.id;
  let application = await InternshipApplication.findOne({
    $and: [
      { _id: mongoose.Types.ObjectId.isValid(appId) ? appId : null },
      { $or: [{ studentId: req.user._id }, { user: req.user._id }] }
    ]
  });

  if (!application) {
    application = await InternshipApplication.findOne({
      applicationId: String(appId).trim().toUpperCase(),
      $or: [{ studentId: req.user._id }, { user: req.user._id }]
    });
  }

  if (!application) {
    return res.status(404).json({ success: false, message: 'Application not found or unauthorized.' });
  }

  if (['Selected', 'Completed'].includes(application.status)) {
    return res.status(400).json({ success: false, message: `Cannot withdraw an application with status "${application.status}".` });
  }

  if (application.status === 'Withdrawn') {
    return res.status(400).json({ success: false, message: 'This application is already marked as Withdrawn.' });
  }

  const reason = (req.body.reason || req.body.withdrawalReason || 'Withdrawn by candidate').trim();
  application.status = 'Withdrawn';
  application.withdrawnAt = new Date();
  application.withdrawalReason = reason;
  application.statusHistory.push({
    status: 'Withdrawn',
    changedAt: new Date(),
    note: reason,
    changedBy: req.user.fullName || 'Candidate'
  });
  await application.save();

  // Keep InternshipRegistration in sync
  await InternshipRegistration.findOneAndUpdate(
    { studentId: req.user._id, internshipId: application.internshipId },
    { status: 'Withdrawn' }
  );

  res.json({
    success: true,
    message: 'Application has been withdrawn successfully.',
    application
  });
}));

// Student Career Dashboard & Analytics
app.get('/api/careers/dashboard', authenticateUser, asyncRoute(async (req, res) => {
  const userId = req.user._id;

  // 1. Applications by User
  const applications = await InternshipApplication.find({
    $or: [{ studentId: userId }, { user: userId }]
  })
    .populate('internshipId')
    .sort({ createdAt: -1 })
    .lean();

  const totalApplications = applications.length;
  const underReview = applications.filter(a => ['Applied', 'Submitted', 'Under Review'].includes(a.status)).length;
  const shortlisted = applications.filter(a => ['Shortlisted', 'Interview'].includes(a.status)).length;
  const selected = applications.filter(a => a.status === 'Selected').length;

  // 2. Saved / Bookmarked Internships
  const bookmarks = await InternshipBookmark.find({ studentId: userId })
    .populate({
      path: 'internshipId',
      populate: { path: 'companyId' }
    })
    .sort({ createdAt: -1 })
    .lean();

  const savedCount = bookmarks.length;
  const savedInternships = bookmarks.filter(b => b.internshipId).map(b => b.internshipId);

  // 3. Upcoming Application Deadlines (next 30 days)
  const now = new Date();
  const next30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const upcomingDeadlines = await Internship.find({
    status: 'active',
    deadline: { $gte: now, $lte: next30Days }
  })
    .sort({ deadline: 1 })
    .limit(4)
    .lean();

  // 4. Calculate Profile Completeness
  const profileFields = [
    req.user.fullName,
    req.user.email,
    req.user.phone,
    req.user.college || req.user.institution,
    req.user.department,
    req.user.year,
    req.user.bio,
    req.user.linkedin,
    req.user.github,
    (req.user.skills && req.user.skills.length > 0) ? req.user.skills : null
  ];
  const filledCount = profileFields.filter(Boolean).length;
  const profileCompleteness = Math.round((filledCount / profileFields.length) * 100);

  // 5. Recommended Internships based on student skills
  const appliedInternshipIds = applications.map(a => (a.internshipId?._id || a.internshipId)?.toString()).filter(Boolean);
  const userSkills = Array.isArray(req.user.skills) ? req.user.skills : [];

  let recFilter = {
    status: 'active',
    _id: { $nin: appliedInternshipIds },
    deadline: { $gte: now }
  };
  if (userSkills.length > 0) {
    recFilter.skills = { $in: userSkills.map(s => new RegExp(s, 'i')) };
  }

  let recommendedInternships = await Internship.find(recFilter).limit(3).lean();
  if (recommendedInternships.length < 3) {
    const fallback = await Internship.find({
      status: 'active',
      _id: { $nin: [...appliedInternshipIds, ...recommendedInternships.map(r => r._id)] },
      deadline: { $gte: now }
    }).limit(3 - recommendedInternships.length).lean();
    recommendedInternships = [...recommendedInternships, ...fallback];
  }

  // 6. Skill-Gap Recommendations: map missing skills to courses & Playzone games
  const allNeededSkills = new Set();
  savedInternships.forEach(item => {
    if (Array.isArray(item.skills)) item.skills.forEach(s => allNeededSkills.add(s));
  });
  applications.forEach(a => {
    if (a.internshipId && Array.isArray(a.internshipId.skills)) {
      a.internshipId.skills.forEach(s => allNeededSkills.add(s));
    }
  });

  const skillsToImprove = Array.from(allNeededSkills)
    .filter(s => !userSkills.some(us => us.toLowerCase() === s.toLowerCase()))
    .slice(0, 6);

  const recommendedCourses = await Course.find({
    status: 'active',
    $or: [
      { tags: { $in: skillsToImprove.map(s => new RegExp(s, 'i')) } },
      { title: { $in: skillsToImprove.map(s => new RegExp(s, 'i')) } }
    ]
  }).select('title category thumbnail xp duration level').limit(3).lean();

  const recommendedGames = await Game.find({
    status: 'active'
  }).select('title gameType icon color difficulty xpReward slug').limit(3).lean();

  res.json({
    success: true,
    stats: {
      totalApplications,
      underReview,
      shortlisted,
      selected,
      savedCount,
      profileCompleteness
    },
    applications,
    savedInternships,
    upcomingDeadlines,
    recommendedInternships,
    skillsToImprove,
    recommendedCourses,
    recommendedGames
  });
}));

// Career Preparation Tools & Checklists
app.get('/api/careers/prep-tools', asyncRoute(async (req, res) => {
  const prepTools = {
    applicationChecklist: [
      { id: 'c1', title: 'Resume PDF formatted to 1-2 pages without formatting glitches', category: 'Resume' },
      { id: 'c2', title: 'LinkedIn Profile updated with current coursework & certifications', category: 'Profile' },
      { id: 'c3', title: 'GitHub or portfolio links verified and active', category: 'Portfolio' },
      { id: 'c4', title: 'Review role requirements and tailor cover note for specific role', category: 'Application' },
      { id: 'c5', title: 'Verify minimum eligibility criteria (academic year and aggregate %)', category: 'Eligibility' }
    ],
    interviewQuestions: [
      {
        role: 'Frontend & Full Stack',
        question: 'Explain the difference between synchronous and asynchronous code execution in the JavaScript Event Loop.',
        tip: 'Discuss the Call Stack, Web APIs, Task Queue (Macrotasks), and Microtask Queue (Promises).'
      },
      {
        role: 'Backend & Cloud',
        question: 'What are database indexing best practices, and what is the tradeoff of creating too many indexes on high-write tables?',
        tip: 'Indexes speed up SELECT queries via B-Trees, but introduce write overhead on every INSERT/UPDATE/DELETE.'
      },
      {
        role: 'Data Science & AI',
        question: 'How do you detect and handle overfitting in machine learning models?',
        tip: 'Mention cross-validation, regularization (L1/L2), dropout, pruning, and gathering more training data.'
      }
    ]
  };
  res.json({ success: true, prepTools });
}));


// ==========================================
// 8. EVENT ROUTES
// ==========================================
app.get('/api/events', asyncRoute(async (req, res) => {
  const query = req.query.all === 'true' ? {} : { status: 'active' };
  const events = await Event.find(query).sort({ date: 1 });
  res.json({ success: true, events });
}));

app.get('/api/events/:id', asyncRoute(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  res.json({ success: true, event });
}));

app.post('/api/events/:id/register', authenticateUser, asyncRoute(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event || event.status !== 'active') return res.status(404).json({ success: false, message: 'Event not found or inactive.' });

  if (event.participants.some(id => id.equals(req.user._id))) {
    return res.status(409).json({ success: false, message: 'You have already registered for this event.' });
  }

  if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
    return res.status(409).json({ success: false, message: 'This event has reached full registration capacity.' });
  }

  event.participants.push(req.user._id);
  await event.save();

  await EventRegistration.findOneAndUpdate(
    { user: req.user._id, event: event._id },
    { user: req.user._id, studentId: req.user._id, event: event._id, registrationDate: new Date(), status: 'registered' },
    { upsert: true }
  );

  await User.findByIdAndUpdate(req.user._id, { $addToSet: { events: event._id } });
  await awardXP(req.user._id, 'event_participation', `Registered for event: ${event.title}`);

  res.json({ success: true, message: 'Event registration successful! +50 XP awarded.' });
}));

app.get('/api/events/my-events', authenticateUser, asyncRoute(async (req, res) => {
  const registrations = await EventRegistration.find({ user: req.user._id }).populate('event');
  res.json({ success: true, registrations });
}));

// ==========================================
// 9. TECH GAMES ROUTES (TECH QUIZ & DEBUGGING GAME)
// ==========================================

async function findGameByIdOrSlug(idOrSlug) {
  if (!idOrSlug) return null;
  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    const byId = await Game.findOne({ _id: idOrSlug, status: 'active' });
    if (byId) return byId;
  }
  const clean = String(idOrSlug).trim().toLowerCase();
  const bySlug = await Game.findOne({
    $or: [
      { slug: clean },
      { gameType: clean },
      { title: new RegExp(`^${clean.replace(/[-_]/g, ' ')}$`, 'i') },
      { title: new RegExp(clean.replace(/[-_]/g, '.*'), 'i') }
    ],
    status: 'active'
  });
  if (bySlug) return bySlug;

  if (clean === 'tech-quiz' || clean === 'tech quiz' || clean === 'quiz') {
    return await Game.findOne({ title: 'TECH QUIZ', status: 'active' });
  }
  if (clean === 'debugging-game' || clean === 'debugging game' || clean === 'debugging') {
    return await Game.findOne({ title: 'DEBUGGING GAME', status: 'active' });
  }
  return null;
}

// 1. GET /api/games - List Playzone Games with filters, search, and personal stats
app.get('/api/games', authenticateOptionalUser, asyncRoute(async (req, res) => {
  const { category, difficulty, search, gameType } = req.query;
  const filter = { status: 'active' };

  if (category && category !== 'All') {
    filter.$or = [
      { category: new RegExp(category.trim(), 'i') },
      { tags: { $in: [new RegExp(category.trim(), 'i')] } }
    ];
  }

  if (difficulty && difficulty !== 'All') {
    filter.difficulty = difficulty;
  }

  if (gameType && gameType !== 'All') {
    filter.gameType = gameType;
  }

  if (search && search.trim()) {
    const sTerm = search.trim();
    filter.$or = [
      { title: new RegExp(sTerm, 'i') },
      { description: new RegExp(sTerm, 'i') },
      { tags: { $in: [new RegExp(sTerm, 'i')] } },
      { category: new RegExp(sTerm, 'i') }
    ];
  }

  const games = await Game.find(filter)
    .select('-testCases.expectedOutput -questions.correctAnswer -questions.explanation')
    .sort({ createdAt: 1 })
    .lean();

  // Find daily rotating challenge index
  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const dailyIndex = dayOfYear % (games.length || 1);

  // If user is authenticated, query their best scores
  let userBestScores = new Map();
  if (req.user) {
    const results = await GameResult.find({
      $or: [{ userId: req.user._id }, { studentId: req.user._id }],
      status: { $ne: 'in-progress' }
    }).select('gameId score').lean();

    results.forEach(r => {
      if (r.gameId) {
        const idStr = r.gameId.toString();
        const curBest = userBestScores.get(idStr) || 0;
        if (r.score > curBest) userBestScores.set(idStr, r.score);
      }
    });
  }

  const enrichedGames = await Promise.all(games.map(async (g, idx) => {
    const questionCount = await GameQuestion.countDocuments({ gameId: g._id, isActive: true });
    const plays = await GameResult.countDocuments({ gameId: g._id, status: { $ne: 'in-progress' } });
    const userBest = userBestScores.get(g._id.toString()) || null;

    return {
      ...g,
      totalQuestions: questionCount || 6,
      playCount: plays || g.playCount || 0,
      userBestScore: userBest,
      userCompleted: userBest !== null,
      isDailyChallenge: idx === dailyIndex
    };
  }));

  res.json({
    success: true,
    total: enrichedGames.length,
    games: enrichedGames,
    dailyChallenge: enrichedGames[dailyIndex] || null
  });
}));

// 2. GET /api/games/daily-challenge - Get rotating challenge of the day with bonus XP
app.get('/api/games/daily-challenge', authenticateOptionalUser, asyncRoute(async (req, res) => {
  const games = await Game.find({ status: 'active' }).select('-testCases.expectedOutput').sort({ createdAt: 1 }).lean();
  if (games.length === 0) return res.status(404).json({ success: false, message: 'No active games found.' });

  const dayOfYear = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const dailyIndex = dayOfYear % games.length;
  const challengeGame = games[dailyIndex];

  const questionCount = await GameQuestion.countDocuments({ gameId: challengeGame._id, isActive: true });

  let userCompletedToday = false;
  let userBestScore = null;

  if (req.user) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayResult = await GameResult.findOne({
      $or: [{ userId: req.user._id }, { studentId: req.user._id }],
      gameId: challengeGame._id,
      status: { $ne: 'in-progress' },
      createdAt: { $gte: startOfDay }
    });
    userCompletedToday = !!todayResult;
    userBestScore = todayResult ? todayResult.score : null;
  }

  res.json({
    success: true,
    dailyChallenge: {
      ...challengeGame,
      totalQuestions: questionCount,
      bonusXP: 30,
      streakReward: 'Daily Streak Bonus (+30 XP)',
      userCompletedToday,
      userBestScore
    }
  });
}));

// 3. GET /api/games/leaderboard - Top ranked game players based on verified scores
app.get('/api/games/leaderboard', asyncRoute(async (req, res) => {
  const topResults = await GameResult.aggregate([
    { $match: { status: { $ne: 'in-progress' } } },
    {
      $group: {
        _id: { $ifNull: ['$studentId', '$userId'] },
        totalScore: { $sum: '$score' },
        totalXP: { $sum: '$xpEarned' },
        gamesPlayed: { $sum: 1 },
        avgScore: { $avg: '$score' },
        lastPlayed: { $max: '$createdAt' }
      }
    },
    { $sort: { totalScore: -1, totalXP: -1 } },
    { $limit: 20 }
  ]);

  const userIds = topResults.map(r => r._id).filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } })
    .select('fullName department college institution profileImageUrl xp level')
    .lean();

  const userMap = new Map();
  users.forEach(u => userMap.set(u._id.toString(), u));

  const leaderboard = topResults.map((r, index) => {
    const user = userMap.get(r._id?.toString()) || { fullName: 'Anonymous Learner', department: 'Computer Science' };
    return {
      rank: index + 1,
      userId: r._id,
      fullName: user.fullName || 'Student',
      department: user.department || user.college || 'Engineering',
      profileImageUrl: user.profileImageUrl || '',
      overallXP: user.xp || r.totalXP,
      level: user.level || 1,
      gamesPlayed: r.gamesPlayed,
      totalGameScore: r.totalScore,
      totalGameXP: r.totalXP,
      accuracy: Math.round(r.avgScore || 0)
    };
  });

  res.json({ success: true, count: leaderboard.length, leaderboard });
}));

// 4. GET /api/games/my-history - Authenticated student's game play history
app.get('/api/games/my-history', authenticateUser, asyncRoute(async (req, res) => {
  const results = await GameResult.find({
    $or: [{ userId: req.user._id }, { studentId: req.user._id }],
    status: { $ne: 'in-progress' }
  })
    .populate('gameId', 'title gameType icon color difficulty xpReward')
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  const totalGamesPlayed = results.length;
  const totalXpEarned = results.reduce((sum, r) => sum + (r.xpEarned || 0), 0);
  const avgAccuracy = totalGamesPlayed > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.score || 0), 0) / totalGamesPlayed)
    : 0;

  res.json({
    success: true,
    stats: {
      totalGamesPlayed,
      totalXpEarned,
      avgAccuracy
    },
    history: results
  });
}));

// 5. GET /api/games/:id - Retrieve specific game by ID or slug
app.get('/api/games/:id', asyncRoute(async (req, res) => {
  if (['daily-challenge', 'leaderboard', 'my-history'].includes(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }

  const game = await findGameByIdOrSlug(req.params.id);
  if (!game) return res.status(404).json({ success: false, message: 'Game not found.' });

  const gameObj = game.toObject ? game.toObject() : { ...game };
  const questionCount = await GameQuestion.countDocuments({ gameId: game._id, isActive: true });
  gameObj.totalQuestions = questionCount || 6;

  // Security: Never leak answers from embedded questions if any
  if (Array.isArray(gameObj.questions)) {
    gameObj.questions.forEach(q => {
      delete q.correctAnswer;
      delete q.explanation;
    });
  }

  res.json({ success: true, game: gameObj });
}));

// 6. GET /api/games/:id/questions - Retrieve questions/levels (Security: strip correct answers!)
app.get('/api/games/:id/questions', asyncRoute(async (req, res) => {
  const game = await findGameByIdOrSlug(req.params.id);
  if (!game) return res.status(404).json({ success: false, message: 'Game not found.' });

  // Security: Never expose correctAnswer or expectedAnswer to student frontend!
  const questions = await GameQuestion.find({ gameId: game._id, isActive: true })
    .select('-correctAnswer -expectedAnswer -explanation')
    .sort({ level: 1, createdAt: 1 })
    .lean();

  res.json({
    success: true,
    game: {
      _id: game._id,
      title: game.title,
      slug: game.slug,
      gameType: game.gameType,
      category: game.category,
      difficulty: game.difficulty,
      timeLimit: game.timeLimit,
      xpReward: game.xpReward,
      rules: game.rules || []
    },
    totalQuestions: questions.length,
    questions
  });
}));

app.post('/api/games/:id/start', authenticateUser, asyncRoute(async (req, res) => {
  const game = await findGameByIdOrSlug(req.params.id);
  if (!game) return res.status(404).json({ success: false, message: 'Game not found.' });

  const { attemptId } = req.body;
  if (typeof attemptId !== 'string' || !/^[a-zA-Z0-9-]{8,100}$/.test(attemptId)) {
    return res.status(400).json({ success: false, message: 'A valid quiz attempt ID is required.' });
  }

  const attemptFilter = { studentId: req.user._id, gameId: game._id, attemptId };
  let attempt = await GameResult.findOne(attemptFilter);
  if (!attempt) {
    const totalQuestions = await GameQuestion.countDocuments({ gameId: game._id, isActive: true });
    if (!totalQuestions) return res.status(409).json({ success: false, message: 'This game has no active questions.' });
    try {
      attempt = await GameResult.create({
        ...attemptFilter,
        user: req.user._id,
        game: game._id,
        gameType: game.gameType || 'quiz',
        score: 0,
        totalQuestions,
        status: 'in-progress'
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      attempt = await GameResult.findOne(attemptFilter);
      if (!attempt) throw error;
    }
  }

  if (attempt.status === 'completed') {
    return res.status(409).json({ success: false, message: 'This quiz attempt is already complete.' });
  }
  return res.json({ success: true, attemptId, totalQuestions: attempt.totalQuestions });
}));

app.post('/api/games/:id/answer', authenticateUser, asyncRoute(async (req, res) => {
  const game = await findGameByIdOrSlug(req.params.id);
  if (!game) return res.status(404).json({ success: false, message: 'Game not found.' });

  const { attemptId, questionId, selectedIndex } = req.body;
  if (typeof attemptId !== 'string' || !/^[a-zA-Z0-9-]{8,100}$/.test(attemptId)) {
    return res.status(400).json({ success: false, message: 'A valid quiz attempt ID is required.' });
  }
  if (!mongoose.Types.ObjectId.isValid(questionId) || !Number.isInteger(selectedIndex) || selectedIndex < 0) {
    return res.status(400).json({ success: false, message: 'A valid question and answer option are required.' });
  }

  const question = await GameQuestion.findOne({
    _id: questionId,
    gameId: game._id,
    isActive: true
  }).select('options correctAnswer explanation');
  if (!question || selectedIndex >= question.options.length) {
    return res.status(404).json({ success: false, message: 'Question or answer option not found.' });
  }

  const attemptFilter = {
    studentId: req.user._id,
    gameId: game._id,
    attemptId
  };
  let attempt = await GameResult.findOne(attemptFilter);
  if (!attempt) {
    try {
      attempt = await GameResult.create({
        ...attemptFilter,
        user: req.user._id,
        game: game._id,
        gameType: game.gameType || 'quiz',
        score: 0,
        totalQuestions: await GameQuestion.countDocuments({ gameId: game._id, isActive: true }),
        status: 'in-progress'
      });
    } catch (error) {
      if (error.code !== 11000) throw error;
      attempt = await GameResult.findOne(attemptFilter);
      if (!attempt) throw error;
    }
  }

  if (attempt.status === 'completed') {
    return res.status(409).json({ success: false, message: 'This quiz attempt is already complete.' });
  }

  let recorded = attempt.responses.find(response => response.questionId.equals(question._id));
  if (!recorded) {
    attempt = await GameResult.findOneAndUpdate(
      {
        ...attemptFilter,
        status: 'in-progress',
        'responses.questionId': { $ne: question._id }
      },
      {
        $push: {
          responses: {
            questionId: question._id,
            selectedIndex,
            isCorrect: selectedIndex === Number(question.correctAnswer)
          }
        }
      },
      { new: true }
    );
    if (!attempt) {
      attempt = await GameResult.findOne(attemptFilter);
      if (!attempt) return res.status(404).json({ success: false, message: 'Quiz attempt not found.' });
    }
    recorded = attempt.responses.find(response => response.questionId.equals(question._id));
  }

  return res.json({
    success: true,
    selectedIndex: recorded.selectedIndex,
    isCorrect: recorded.isCorrect,
    correctIndex: Number(question.correctAnswer),
    explanation: question.explanation || ''
  });
}));

// 7. Universal Server-Validated Submission Handler (Anti-Tampering XP & Correctness)
const handleGameSubmit = asyncRoute(async (req, res) => {
  const game = await findGameByIdOrSlug(req.params.id);
  if (!game) return res.status(404).json({ success: false, message: 'Game not found.' });

  const isLevelBased = game.gameType === 'debugging' ||
                       game.title === 'DEBUGGING GAME' ||
                       req.body.action === 'check-level' ||
                       (req.body.level !== undefined && !req.body.answers);

  // ----------------------------------------------------
  // A. Single Level / Question Check (Debugging, Bug Hunter, SQL Quest single step)
  // ----------------------------------------------------
  if (isLevelBased) {
    const targetLevel = Number(req.body.level) || 1;
    const userAnswer = String(req.body.answer || req.body.correctedAnswer || '').trim();
    const userCode = String(req.body.code || '').trim();
    const selectedIndex = req.body.selectedIndex !== undefined ? Number(req.body.selectedIndex) : undefined;

    const question = await GameQuestion.findOne({
      gameId: game._id,
      level: targetLevel,
      isActive: true
    });

    if (!question) {
      return res.status(404).json({ success: false, message: `Level ${targetLevel} question not found.` });
    }

    let isMatch = false;

    // Check multiple-choice index if present
    if (typeof selectedIndex !== 'undefined') {
      if (Number(question.correctAnswer) === selectedIndex) {
        isMatch = true;
      }
    }

    // Check string tokens
    const expected = String(question.expectedAnswer || question.correctAnswer || '').trim().toLowerCase();
    const buggy = (question.options && question.options[0]) ? String(question.options[0]).trim().toLowerCase() : '';

    if (!isMatch && userAnswer) {
      const cleanUser = userAnswer.toLowerCase();
      if (cleanUser === expected || cleanUser.includes(expected)) {
        isMatch = true;
      }
    }

    // Check code snippet text
    if (!isMatch && userCode) {
      const cleanCode = userCode.toLowerCase();
      if (cleanCode.includes(expected)) {
        if (!buggy || !cleanCode.includes(buggy)) {
          isMatch = true;
        }
      }
    }

    if (!isMatch) {
      return res.json({
        success: true,
        correct: false,
        isCorrect: false,
        message: 'Incorrect answer. Try inspecting the syntax or review the hint.'
      });
    }

    // Level Solved Correctly! Server-side XP verification with duplicate prevention
    const xpReward = question.xp || 20;

    const existingResult = await GameResult.findOne({
      $or: [{ userId: req.user._id }, { studentId: req.user._id }],
      gameId: game._id,
      gameType: `${game.gameType}-level-${targetLevel}`
    });

    let awardedXP = 0;
    if (!existingResult) {
      awardedXP = xpReward;
      await awardXP(
        req.user._id,
        awardedXP,
        `${game.title} - Level ${targetLevel} Solved! (+${awardedXP} XP)`,
        { source: 'game', referenceId: `${game._id}:level:${targetLevel}` }
      );
    }

    await GameResult.create({
      userId: req.user._id,
      studentId: req.user._id,
      user: req.user._id,
      gameId: game._id,
      game: game._id,
      gameType: `${game.gameType}-level-${targetLevel}`,
      score: 100,
      xp: awardedXP,
      xpEarned: awardedXP,
      completedAt: new Date()
    });

    return res.json({
      success: true,
      correct: true,
      isCorrect: true,
      message: 'Correct ✓',
      level: targetLevel,
      xpEarned: awardedXP,
      explanation: question.explanation || 'Great job solving this challenge!'
    });
  }

  // ----------------------------------------------------
  // B. SQL QUEST Interactive Sandbox Evaluator
  // ----------------------------------------------------
  if (game.gameType === 'sql-quest' && req.body.sqlQuery) {
    const rawSql = String(req.body.sqlQuery).trim();
    const targetLevel = Number(req.body.level) || 1;

    const question = await GameQuestion.findOne({
      gameId: game._id,
      level: targetLevel,
      isActive: true
    });

    if (!question) {
      return res.status(404).json({ success: false, message: `SQL Challenge level ${targetLevel} not found.` });
    }

    const cleanSql = rawSql.toUpperCase().replace(/\s+/g, ' ');
    const expectedQuery = String(question.expectedAnswer || question.correctAnswer || '').toUpperCase().replace(/\s+/g, ' ');

    // Safe semantic evaluation: checks clauses and keywords without running raw SQL on DB
    const isExactMatch = cleanSql === expectedQuery;
    const hasRequiredKeywords = cleanSql.startsWith('SELECT') || cleanSql.startsWith('UPDATE') || cleanSql.startsWith('INSERT');

    let isValid = isExactMatch;
    if (!isValid && hasRequiredKeywords) {
      if (cleanSql.includes('FROM STUDENTS') || cleanSql.includes('JOIN') || cleanSql.includes('WHERE') || cleanSql.includes('ORDER BY')) {
        isValid = true;
      }
    }

    if (!isValid) {
      return res.json({
        success: true,
        isCorrect: false,
        correct: false,
        message: 'Query did not produce expected results. Check syntax and required clauses.'
      });
    }

    const xpReward = question.xp || 25;
    const existingResult = await GameResult.findOne({
      $or: [{ userId: req.user._id }, { studentId: req.user._id }],
      gameId: game._id,
      gameType: `sql-quest-level-${targetLevel}`
    });

    let awardedXP = 0;
    if (!existingResult) {
      awardedXP = xpReward;
      await awardXP(
        req.user._id,
        awardedXP,
        `SQL Quest - Level ${targetLevel} Completed! (+${awardedXP} XP)`,
        { source: 'game', referenceId: `${game._id}:sql-level:${targetLevel}` }
      );
    }

    await GameResult.create({
      userId: req.user._id,
      studentId: req.user._id,
      gameId: game._id,
      gameType: `sql-quest-level-${targetLevel}`,
      score: 100,
      xp: awardedXP,
      xpEarned: awardedXP,
      completedAt: new Date()
    });

    return res.json({
      success: true,
      isCorrect: true,
      correct: true,
      message: 'Query Executed Successfully ✓',
      xpEarned: awardedXP,
      explanation: question.explanation,
      simulatedOutput: question.sqlScenario?.expectedRows || []
    });
  }

  // ----------------------------------------------------
  // C. Full Multi-Question Assessment (Code Sprint, Logic Master, AI Arena, Web Design, Tech Quiz)
  // ----------------------------------------------------
  const questions = await GameQuestion.find({ gameId: game._id, isActive: true })
    .sort({ level: 1, createdAt: 1 });

  const totalQuestions = questions.length || 6;
  const attemptId = req.body.attemptId;
  if (attemptId !== undefined && (typeof attemptId !== 'string' || !/^[a-zA-Z0-9-]{8,100}$/.test(attemptId))) {
    return res.status(400).json({ success: false, message: 'A valid quiz attempt ID is required.' });
  }
  const attemptFilter = attemptId ? {
    studentId: req.user._id,
    gameId: game._id,
    attemptId
  } : null;
  let attempt = attemptFilter ? await GameResult.findOne(attemptFilter) : null;

  if (attemptId && !attempt) {
    return res.status(400).json({ success: false, message: 'Answer at least one question before viewing results.' });
  }
  if (attempt?.status === 'completed') {
    return res.json({
      success: true,
      score: attempt.score,
      accuracy: attempt.score,
      percentage: attempt.score,
      correctCount: attempt.responses.filter(response => response.isCorrect).length,
      wrongCount: attempt.totalQuestions - attempt.responses.filter(response => response.isCorrect).length,
      totalQuestions: attempt.totalQuestions,
      xpEarned: attempt.xpEarned || 0,
      timeTaken: attempt.timeTaken || 0,
      alreadyCompleted: true
    });
  }

  const userAnswers = attempt
    ? Object.fromEntries(attempt.responses.map(response => [String(response.questionId), response.selectedIndex]))
    : (req.body.answers || {});
  let correctCount = 0;
  const feedbackList = [];

  questions.forEach((q, idx) => {
    let chosen = undefined;
    if (typeof userAnswers[q._id] !== 'undefined') {
      chosen = Number(userAnswers[q._id]);
    } else if (typeof userAnswers[String(q._id)] !== 'undefined') {
      chosen = Number(userAnswers[String(q._id)]);
    } else if (Array.isArray(userAnswers) && typeof userAnswers[idx] !== 'undefined') {
      chosen = Number(userAnswers[idx]);
    } else if (typeof userAnswers[idx] !== 'undefined') {
      chosen = Number(userAnswers[idx]);
    }

    const isCorrect = typeof chosen !== 'undefined' && chosen === Number(q.correctAnswer);
    if (isCorrect) correctCount++;

    feedbackList.push({
      questionId: q._id,
      question: q.question,
      chosenIndex: chosen,
      correctIndex: q.correctAnswer,
      isCorrect,
      explanation: q.explanation
    });
  });

  const wrongCount = totalQuestions - correctCount;
  const scorePercent = Math.round((correctCount / totalQuestions) * 100);
  const timeTaken = Number(req.body.timeTaken) || 0;

  // Anti-Tampering XP Calculation:
  // Check if student has already achieved this score or higher on this game
  const previousBest = await GameResult.findOne({
    $or: [{ userId: req.user._id }, { studentId: req.user._id }],
    gameId: game._id,
    status: { $ne: 'in-progress' }
  }).sort({ score: -1 });

  const maxPossibleXP = game.xpReward || 120;
  let xpEarned = 0;

  if (!previousBest) {
    // First time playing: award score-proportional XP
    xpEarned = Math.round((scorePercent / 100) * maxPossibleXP);
  } else if (scorePercent > previousBest.score) {
    // Score improvement: award the incremental delta XP
    const prevXP = Math.round((previousBest.score / 100) * maxPossibleXP);
    const newXP = Math.round((scorePercent / 100) * maxPossibleXP);
    xpEarned = Math.max(0, newXP - prevXP);
  } else {
    // Replay with same or lower score: award modest practice bonus (5 XP) to prevent XP farming
    xpEarned = scorePercent >= 60 ? 5 : 0;
  }

  // Persist the result before awarding XP so retries for this attempt cannot earn twice.
  const resultFields = {
    userId: req.user._id,
    studentId: req.user._id,
    user: req.user._id,
    gameId: game._id,
    game: game._id,
    gameType: game.gameType || 'quiz',
    score: scorePercent,
    accuracy: scorePercent,
    totalQuestions,
    xp: xpEarned,
    xpEarned,
    timeTaken,
    completedAt: new Date(),
    status: 'completed'
  };

  if (attempt) {
    const completedAttempt = await GameResult.findOneAndUpdate(
      { _id: attempt._id, status: 'in-progress' },
      { $set: resultFields },
      { new: true }
    );
    if (!completedAttempt) {
      const existingAttempt = await GameResult.findById(attempt._id);
      return res.json({
        success: true,
        score: existingAttempt.score,
        accuracy: existingAttempt.score,
        percentage: existingAttempt.score,
        correctCount: existingAttempt.responses.filter(response => response.isCorrect).length,
        wrongCount: existingAttempt.totalQuestions - existingAttempt.responses.filter(response => response.isCorrect).length,
        totalQuestions: existingAttempt.totalQuestions,
        xpEarned: existingAttempt.xpEarned || 0,
        timeTaken: existingAttempt.timeTaken || 0,
        alreadyCompleted: true
      });
    }
  } else {
    await GameResult.create(resultFields);
  }

  if (xpEarned > 0) {
    await awardXP(
      req.user._id,
      xpEarned,
      `${game.title} completed: Score ${scorePercent}% (${correctCount}/${totalQuestions}) +${xpEarned} XP`,
      { source: 'game', referenceId: attemptId || '' }
    );
  }

  res.json({
    success: true,
    score: scorePercent,
    accuracy: scorePercent,
    percentage: scorePercent,
    correctCount,
    wrongCount,
    totalQuestions,
    xpEarned,
    timeTaken,
    feedback: feedbackList
  });
});

app.post('/api/games/:id/submit', authenticateUser, handleGameSubmit);
app.post('/api/games/:id/check-level', authenticateUser, handleGameSubmit);
app.post('/api/games/:id/attempt', authenticateUser, handleGameSubmit);
app.post('/api/games/:id/result', authenticateUser, handleGameSubmit);

// ==========================================
// 10. DISCUSSION ROUTES
// ==========================================
app.get('/api/discussions', asyncRoute(async (req, res) => {
  const discussions = await Discussion.find({ status: 'active' })
    .populate('author', 'fullName department profileImageUrl')
    .sort({ createdAt: -1 });

  // Enrich with replies count
  const withCounts = await Promise.all(discussions.map(async d => {
    const repliesCount = await Reply.countDocuments({ discussion: d._id });
    return { ...d.toObject(), repliesCount };
  }));

  res.json({ success: true, discussions: withCounts });
}));

app.get('/api/discussions/:id', asyncRoute(async (req, res) => {
  const discussion = await Discussion.findById(req.params.id).populate('author', 'fullName department profileImageUrl');
  if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found.' });

  const replies = await Reply.find({ discussion: discussion._id }).populate('author', 'fullName department profileImageUrl').sort({ createdAt: 1 });
  res.json({ success: true, discussion, replies });
}));

app.post('/api/discussions', authenticateUser, [
  body('title').trim().notEmpty().withMessage('Discussion title is required'),
  body('content').trim().notEmpty().withMessage('Content is required')
], validate, asyncRoute(async (req, res) => {
  const discussion = await Discussion.create({
    author: req.user._id,
    title: req.body.title.trim(),
    content: req.body.content.trim(),
    category: req.body.category || 'General',
    status: 'active'
  });

  await awardXP(req.user._id, 10, 'Created a technical discussion');
  res.status(201).json({ success: true, discussion });
}));

app.post('/api/discussions/:id/replies', authenticateUser, [
  body('content').trim().notEmpty().withMessage('Reply content is required')
], validate, asyncRoute(async (req, res) => {
  const discussion = await Discussion.findById(req.params.id);
  if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found.' });

  const reply = await Reply.create({
    discussion: discussion._id,
    author: req.user._id,
    content: req.body.content.trim()
  });

  await awardXP(req.user._id, 5, 'Contributed to a technical discussion');
  res.status(201).json({ success: true, reply });
}));

app.post('/api/discussions/:id/like', authenticateUser, asyncRoute(async (req, res) => {
  const discussion = await Discussion.findById(req.params.id);
  if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found.' });

  const index = discussion.likes.findIndex(id => id.equals(req.user._id));
  if (index >= 0) discussion.likes.splice(index, 1);
  else discussion.likes.push(req.user._id);

  await discussion.save();
  res.json({ success: true, likes: discussion.likes.length, isLiked: index < 0 });
}));

app.delete('/api/discussions/:id', authenticateUser, asyncRoute(async (req, res) => {
  const discussion = await Discussion.findById(req.params.id);
  if (!discussion) return res.status(404).json({ success: false, message: 'Discussion not found.' });

  if (!discussion.author.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Unauthorized to delete this discussion.' });
  }

  await Reply.deleteMany({ discussion: discussion._id });
  await discussion.deleteOne();
  res.json({ success: true, message: 'Discussion deleted.' });
}));

// ==========================================
// 12. CLUB ROUTES
// ==========================================
app.get('/api/clubs', asyncRoute(async (req, res) => {
  const clubs = await Club.find({ status: 'active' }).populate('leader', 'fullName department');
  res.json({ success: true, clubs });
}));

app.get('/api/clubs/:id', asyncRoute(async (req, res) => {
  const club = await Club.findById(req.params.id).populate('leader', 'fullName department').populate('members', 'fullName department college');
  if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });
  res.json({ success: true, club });
}));

app.post('/api/clubs/:id/join', authenticateUser, asyncRoute(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });

  if (club.members.some(id => id.equals(req.user._id))) {
    return res.status(409).json({ success: false, message: 'You are already a member of this club.' });
  }

  if (club.maxMembers && club.members.length >= club.maxMembers) {
    return res.status(409).json({ success: false, message: 'This club is currently at maximum capacity.' });
  }

  club.members.push(req.user._id);
  await club.save();

  await awardXP(req.user._id, 15, `Joined ${club.name}`);
  res.json({ success: true, message: `Successfully joined ${club.name}!` });
}));

app.post('/api/clubs/:id/leave', authenticateUser, asyncRoute(async (req, res) => {
  const club = await Club.findById(req.params.id);
  if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });

  club.members = club.members.filter(id => !id.equals(req.user._id));
  await club.save();

  res.json({ success: true, message: `Left ${club.name}.` });
}));

// ==========================================
// 13. MESSAGING ROUTES
// ==========================================
app.get('/api/messages', authenticateUser, asyncRoute(async (req, res) => {
  const messages = await Message.find({
    $or: [{ sender: req.user._id }, { receiver: req.user._id }]
  })
    .populate('sender receiver', 'fullName email profileImageUrl department')
    .sort({ createdAt: -1 });

  res.json({ success: true, messages });
}));

app.get('/api/messages/users', authenticateUser, asyncRoute(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id }, isActive: true })
    .select('fullName email department college role')
    .sort({ fullName: 1 })
    .limit(100);

  res.json({ success: true, users });
}));

app.post('/api/messages', authenticateUser, [
  body('receiver').notEmpty().withMessage('Receiver ID is required'),
  body('message').trim().notEmpty().withMessage('Message text is required')
], validate, asyncRoute(async (req, res) => {
  const receiver = await User.findById(req.body.receiver);
  if (!receiver) return res.status(404).json({ success: false, message: 'Recipient not found.' });

  const message = await Message.create({
    sender: req.user._id,
    senderId: req.user._id,
    receiver: receiver._id,
    receiverId: receiver._id,
    subject: req.body.subject || 'Peer Message',
    message: req.body.message.trim(),
    read: false
  });

  res.status(201).json({ success: true, message });
}));

app.put('/api/messages/:id/read', authenticateUser, asyncRoute(async (req, res) => {
  const message = await Message.findOneAndUpdate(
    { _id: req.params.id, receiver: req.user._id },
    { read: true },
    { new: true }
  );
  res.json({ success: true, message });
}));

// Notifications API
app.get('/api/notifications', authenticateUser, asyncRoute(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30);
  res.json({ success: true, notifications });
}));

app.put('/api/notifications/:id/read', authenticateUser, asyncRoute(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  res.json({ success: true, notification });
}));

app.put('/api/notifications/read-all', authenticateUser, asyncRoute(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ success: true, message: 'All notifications marked as read' });
}));

// ==========================================
// 14. XP TRANSACTIONS & CONFIG
// ==========================================
app.get('/api/xp/transactions', authenticateUser, asyncRoute(async (req, res) => {
  const transactions = await XPTransaction.find({
    $or: [{ studentId: req.user._id }, { user: req.user._id }]
  }).sort({ date: -1 }).limit(100);

  res.json({ success: true, transactions });
}));

app.get('/api/xp/config', asyncRoute(async (req, res) => {
  const config = await getXPConfig();
  res.json({ success: true, config });
}));

app.put('/api/xp/config', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const config = await getXPConfig();
  const allowed = [
    'courseRegistration', 'lessonCompletion', 'courseCompletion',
    'certificateClaim', 'eventParticipation', 'gameParticipation', 'gameAchievement'
  ];
  for (const k of allowed) {
    if (req.body[k] !== undefined) config[k] = Number(req.body[k]);
  }
  await config.save();
  await recordAudit(req, 'update', 'xp_config', config._id, req.body);
  res.json({ success: true, config });
}));

// ==========================================
// 15. ADMIN MANAGEMENT & CRUD ROUTES
// ==========================================
app.get('/api/admin/dashboard', authenticateUser, requireAdmin, (req, res, next) => handleAdminStats(req, res, next));

const handleAdminStats = asyncRoute(async (req, res) => {
  const [
    students, staff, workers, others, activeStudents, courses, publishedCourses, draftCourses,
    courseRegistrations, certificates, internships, events, games, clubs, discussions, messages, applications, xp,
    totalLessonsAgg, recentCourses
  ] = await Promise.all([
    User.countDocuments({ role: 'student', userType: 'student' }),
    User.countDocuments({ userType: 'staff' }),
    User.countDocuments({ userType: 'worker' }),
    User.countDocuments({ userType: 'other' }),
    User.countDocuments({ role: 'student', isActive: true }),
    Course.countDocuments(),
    Course.countDocuments({ status: 'published' }),
    Course.countDocuments({ status: { $ne: 'published' } }),
    CourseEnrollment.countDocuments(),
    Certificate.countDocuments({ status: 'active' }),
    Internship.countDocuments(),
    Event.countDocuments(),
    Game.countDocuments(),
    Club.countDocuments(),
    Discussion.countDocuments(),
    Message.countDocuments(),
    InternshipApplication.countDocuments(),
    User.aggregate([{ $group: { _id: null, total: { $sum: '$xp' } } }]),
    Course.aggregate([
      { $project: { count: { $size: { $ifNull: ['$lessons', []] } } } },
      { $group: { _id: null, total: { $sum: '$count' } } }
    ]),
    Course.find().sort({ createdAt: -1 }).limit(6).select('title slug category difficulty status lessons totalLessons thumbnail createdAt instructor duration')
  ]);

  const totalUsers = await User.countDocuments();
  const totalLessons = totalLessonsAgg && totalLessonsAgg[0] ? totalLessonsAgg[0].total : 0;

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalStudents: students || await User.countDocuments({ role: 'student' }),
      totalStaff: staff,
      totalWorkers: workers,
      totalOthers: others,
      activeStudents,
      totalCourses: courses,
      publishedCourses,
      draftCourses,
      totalLessons,
      totalCourseRegistrations: courseRegistrations,
      totalCertificates: certificates,
      totalInternships: internships,
      totalInternshipApplications: applications,
      totalEvents: events,
      totalGames: games,
      totalClubs: clubs,
      totalDiscussions: discussions,
      totalMessages: messages,
      totalApplications: applications,
      totalXpEarned: xp[0]?.total || 0
    },
    recentCourses: recentCourses.map(c => ({
      _id: c._id,
      title: c.title,
      slug: c.slug,
      category: c.category,
      difficulty: c.difficulty,
      status: c.status,
      lessonCount: (c.lessons && c.lessons.length) || 0,
      totalLessons: c.totalLessons || (c.lessons && c.lessons.length) || 0,
      instructor: c.instructor,
      duration: c.duration,
      createdAt: c.createdAt
    }))
  });
});

app.get('/api/admin/stats', authenticateUser, requireAdmin, handleAdminStats);
app.get('/api/admin/dashboard-stats', authenticateUser, requireAdmin, handleAdminStats);

// Admin Charts / Reports
app.get('/api/admin/reports', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  // 1. Student Registration Growth (by last 6 months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`, start: d, end: new Date(d.getFullYear(), d.getMonth() + 1, 0) });
  }

  const registrationGrowth = await Promise.all(months.map(async m => {
    const count = await User.countDocuments({ role: 'student', createdAt: { $lte: m.end } });
    return { month: m.label, count };
  }));

  // 2. Course Enrollments distribution
  const courses = await Course.find().select('title');
  const courseEnrollments = await Promise.all(courses.map(async c => {
    const count = await CourseRegistration.countDocuments({ course: c._id });
    return { title: c.title, count };
  }));

  // 3. Internship Applications by status
  const appStatuses = ['Applied', 'Under Review', 'Selected', 'Rejected'];
  const applicationStatusCounts = await Promise.all(appStatuses.map(async status => {
    const count = await InternshipRegistration.countDocuments({ status });
    return { status, count };
  }));

  // 4. Event participation
  const events = await Event.find().select('title participants');
  const eventParticipation = events.map(e => ({ title: e.title, count: e.participants?.length || 0 }));

  // 5. Game participation
  const games = await Game.find().select('title');
  const gameStats = await Promise.all(games.map(async g => {
    const count = await GameResult.countDocuments({ gameId: g._id, status: { $ne: 'in-progress' } });
    return { title: g.title, count };
  }));

  // 6. Certificates issued
  const certificatesCount = await Certificate.countDocuments({ status: 'active' });

  // 7. XP activity by category
  const xpBreakdown = await XPTransaction.aggregate([
    { $group: { _id: '$action', total: { $sum: '$xp' } } }
  ]);

  res.json({
    success: true,
    reports: {
      registrationGrowth,
      courseEnrollments,
      applicationStatusCounts,
      eventParticipation,
      gameStats,
      certificatesIssued: certificatesCount,
      xpBreakdown
    }
  });
}));

// Admin User Management CRUD
app.get('/api/admin/users', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, users, students: users.filter(u => u.role === 'student') });
}));

app.get('/api/admin/students', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
  res.json({ success: true, students });
}));

app.post('/api/admin/users', authenticateUser, requireAdmin, [
  body('fullName').notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
], validate, asyncRoute(async (req, res) => {
  const { email, password } = req.body;
  const username = (req.body.username || email.split('@')[0]).toLowerCase();
  const regNum = req.body.registerNumber || req.body.studentId || `EN-${Date.now().toString().slice(-6)}`;

  if (await User.findOne({ $or: [{ email }, { username }, { registerNumber: regNum }] })) {
    return res.status(409).json({ success: false, message: 'Email, username, or register number already exists.' });
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    ...req.body,
    email,
    username,
    password: hashedPassword,
    registerNumber: regNum,
    studentId: regNum,
    role: req.body.role || 'student',
    isActive: req.body.isActive !== false
  });

  await recordAudit(req, 'create', 'user', user._id, { email });
  res.status(201).json({ success: true, user: publicUser(user) });
}));

app.put('/api/admin/users/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const allowed = [
    'fullName', 'email', 'phone', 'college', 'department', 'year',
    'registerNumber', 'studentId', 'skills', 'bio', 'state', 'city',
    'xp', 'level', 'role', 'isActive'
  ];
  const updates = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) updates[k] = req.body[k];
  }

  if (req.body.password && req.body.password.length >= 8) {
    updates.password = await bcrypt.hash(req.body.password, 12);
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  await recordAudit(req, 'update', 'user', user._id, updates);
  res.json({ success: true, user: publicUser(user) });
}));

app.patch('/api/admin/users/:id/status', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const isActive = req.body.isActive === true || req.body.status === 'active';
  const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  await recordAudit(req, isActive ? 'activate' : 'deactivate', 'user', user._id);
  res.json({ success: true, user: publicUser(user) });
}));

app.delete('/api/admin/users/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  await recordAudit(req, 'delete', 'user', user._id, { email: user.email });
  res.json({ success: true, message: 'User deleted successfully.' });
}));

// Admin Courses CRUD (Complete Course Module Upgrade)
app.get(['/api/admin/courses', '/api/courses/admin'], authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const courses = await Course.find().sort({ createdAt: -1 });
  const enriched = courses.map(c => {
    const obj = c.toObject();
    obj.totalLessons = (c.lessons && c.lessons.length > 0) ? c.lessons.length : (c.totalLessons || 10);
    return obj;
  });
  res.json({ success: true, courses: enriched });
}));

app.get(['/api/admin/courses/:id', '/api/courses/admin/:id'], authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  let course = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    course = await Course.findById(req.params.id);
  }
  if (!course) {
    course = await Course.findOne({ slug: req.params.id });
  }
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  const obj = course.toObject();
  obj.totalLessons = (course.lessons && course.lessons.length > 0) ? course.lessons.length : (course.totalLessons || 10);
  res.json({ success: true, course: obj });
}));

app.post(['/api/admin/courses', '/api/courses'], authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ success: false, message: 'Course title / name is required.' });
  }
  if (!description || !description.trim()) {
    return res.status(400).json({ success: false, message: 'Course description is required.' });
  }

  const normalizedTitlePattern = new RegExp(
    `^${title.trim().split(/\s+/).map(part => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')}$`,
    'i'
  );
  const duplicateCourse = await Course.findOne({
    $or: [
      { title: normalizedTitlePattern },
      { slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') }
    ]
  }).select('_id title');
  if (duplicateCourse) {
    return res.status(409).json({
      success: false,
      message: `A course named "${duplicateCourse.title}" already exists.`,
      courseId: duplicateCourse._id
    });
  }

  // Parse lists if provided as strings or arrays
  const parseList = val => {
    if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
    if (typeof val === 'string' && val.trim()) {
      return val.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const status = req.body.status === 'draft' ? 'draft' : 'published';
  const difficulty = ['Beginner', 'Intermediate', 'Advanced'].includes(req.body.difficulty) ? req.body.difficulty : 'Beginner';
  const xpReward = Number(req.body.xp || req.body.xpReward || 500);

  const courseData = {
    title: title.trim(),
    description: description.trim(),
    instructor: req.body.instructor ? req.body.instructor.trim() : 'Admin',
    category: req.body.category ? req.body.category.trim() : 'General Technology',
    difficulty,
    level: difficulty,
    duration: req.body.duration ? req.body.duration.trim() : '30 Days',
    thumbnail: req.body.thumbnail || req.body.image || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    image: req.body.image || req.body.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
    requirements: parseList(req.body.prerequisites || req.body.requirements),
    prerequisites: parseList(req.body.prerequisites || req.body.requirements),
    learningOutcomes: parseList(req.body.learningOutcomes || req.body.whatYouWillLearn),
    whatYouWillLearn: parseList(req.body.learningOutcomes || req.body.whatYouWillLearn),
    syllabus: req.body.syllabus ? req.body.syllabus.trim() : '',
    xp: xpReward,
    xpReward,
    totalLessons: Number(req.body.totalLessons || 10),
    status,
    lessons: []
  };

  const course = await Course.create(courseData);
  await recordAudit(req, 'create', 'course', course._id, { title: course.title });

  res.status(201).json({
    success: true,
    message: 'Course created successfully.',
    course
  });
}));

app.put(['/api/admin/courses/:id', '/api/courses/:id'], authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  let course = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    course = await Course.findById(req.params.id);
  }
  if (!course) {
    course = await Course.findOne({ slug: req.params.id });
  }
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  const parseList = val => {
    if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
    if (typeof val === 'string' && val.trim()) {
      return val.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  if (req.body.title !== undefined) {
    course.title = req.body.title.trim();
    course.slug = course.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  if (req.body.description !== undefined) course.description = req.body.description.trim();
  if (req.body.instructor !== undefined) course.instructor = req.body.instructor.trim();
  if (req.body.category !== undefined) course.category = req.body.category.trim();
  if (req.body.duration !== undefined) course.duration = req.body.duration.trim();
  if (req.body.difficulty !== undefined) {
    course.difficulty = req.body.difficulty;
    course.level = req.body.difficulty;
  }
  if (req.body.thumbnail !== undefined) {
    course.thumbnail = req.body.thumbnail;
    course.image = req.body.thumbnail;
  }
  if (req.body.image !== undefined) {
    course.image = req.body.image;
    course.thumbnail = req.body.image;
  }
  if (req.body.xp !== undefined || req.body.xpReward !== undefined) {
    const xpVal = Number(req.body.xp || req.body.xpReward || 500);
    course.xp = xpVal;
    course.xpReward = xpVal;
  }
  if (req.body.status !== undefined) {
    course.status = req.body.status;
  }
  if (req.body.totalLessons !== undefined) {
    course.totalLessons = Number(req.body.totalLessons);
  }
  if (req.body.syllabus !== undefined) {
    course.syllabus = req.body.syllabus.trim();
  }
  if (req.body.prerequisites !== undefined || req.body.requirements !== undefined) {
    const list = parseList(req.body.prerequisites || req.body.requirements);
    course.prerequisites = list;
    course.requirements = list;
  }
  if (req.body.learningOutcomes !== undefined || req.body.whatYouWillLearn !== undefined) {
    const list = parseList(req.body.learningOutcomes || req.body.whatYouWillLearn);
    course.learningOutcomes = list;
    course.whatYouWillLearn = list;
  }

  await course.save();
  await recordAudit(req, 'update', 'course', course._id, { title: course.title });

  res.json({ success: true, message: 'Course updated successfully.', course });
}));

// Permanent Course Deletion (Requirement 12)
app.delete(['/api/admin/courses/:id', '/api/courses/:id'], authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  let course = null;
  if (mongoose.Types.ObjectId.isValid(req.params.id)) {
    course = await Course.findById(req.params.id);
  }
  if (!course) {
    course = await Course.findOne({ slug: req.params.id });
  }
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  // Collect local video files to clean up if unreferenced
  const videoFilesToCheck = [];
  (course.lessons || []).forEach(l => {
    if (l.videoFile) videoFilesToCheck.push(l.videoFile);
    if (l.videoUrl && (l.videoUrl.startsWith('/uploads/') || l.videoUrl.startsWith('/videos/'))) {
      videoFilesToCheck.push(l.videoUrl);
    }
  });

  const courseId = course._id;
  const courseTitle = course.title;
  const lessonsAffected = course.lessons ? course.lessons.length : 0;

  // 1. Delete Course document
  await Course.findByIdAndDelete(courseId);

  // 2. Delete all Lesson documents belonging to the course
  await Lesson.deleteMany({ courseId });

  // 3. Delete course enrollments and registrations
  await CourseEnrollment.deleteMany({ $or: [{ courseId }, { course: courseId }] });
  await CourseRegistration.deleteMany({ course: courseId });

  // 4. Delete lesson progress records
  await LessonProgress.deleteMany({ $or: [{ courseId }, { course: courseId }] });

  // 5. Delete course quiz & quiz attempts
  await Quiz.deleteMany({ courseId });
  await QuizAttempt.deleteMany({ courseId });

  // 6. Clean up unreferenced local video files safely (Requirement 12 & 8)
  for (const vid of videoFilesToCheck) {
    await safeDeleteLocalVideo(vid);
  }

  // Note on Certificates (Requirement 12):
  // Historical Certificate records are intentionally preserved to ensure students' legitimately earned credentials remain authentic and verifiable.

  await recordAudit(req, 'delete', 'course', courseId, { title: courseTitle, lessonsCount: lessonsAffected });

  res.json({
    success: true,
    message: `Course "${courseTitle}" and all ${lessonsAffected} lessons permanently deleted.`,
    lessonsAffected
  });
}));

// Admin Course Publish / Unpublish (Requirements 10 & 12)
const handlePublishCourse = async (req, res) => {
  const targetId = req.params.id || req.params.courseId;
  let course = null;
  if (mongoose.Types.ObjectId.isValid(targetId)) {
    course = await Course.findById(targetId);
  }
  if (!course) {
    course = await Course.findOne({ slug: targetId });
  }
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  // Section 10: Pre-publication validation
  if (!course.title || !course.title.trim()) {
    return res.status(400).json({ success: false, message: 'Course title is required before publishing.' });
  }
  const desc = course.description || course.shortDescription;
  if (!desc || !desc.trim()) {
    return res.status(400).json({ success: false, message: 'Course description is required before publishing.' });
  }

  const lessons = course.lessons || [];
  if (lessons.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Cannot publish course without lessons. Please add at least one valid lesson before publishing.'
    });
  }

  // If course was specified with totalLessons (e.g. 10 lessons), enforce completion
  if (course.totalLessons && course.totalLessons > 0 && lessons.length < course.totalLessons) {
    return res.status(400).json({
      success: false,
      message: `Cannot publish incomplete course. Lessons completed: ${lessons.length} / ${course.totalLessons}. Please create all ${course.totalLessons} lessons before publishing.`
    });
  }

  // Validate each lesson's video source and sequence numbering
  const seenNumbers = new Set();
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    const num = l.lessonNumber || (i + 1);
    if (seenNumbers.has(num)) {
      return res.status(400).json({
        success: false,
        message: `Duplicate lesson number detected at lesson #${num}. Please ensure lesson numbering is unique.`
      });
    }
    seenNumbers.add(num);

    if (!l.title || !l.title.trim()) {
      return res.status(400).json({
        success: false,
        message: `Lesson #${num} is missing a title. All lessons must have a title before publishing.`
      });
    }

    const vType = (l.videoType || '').toLowerCase();
    let hasVideo = false;
    if (vType === 'youtube') {
      hasVideo = Boolean(l.youtubeVideoId || l.youtubeUrl || l.videoUrl);
    } else if (vType === 'local' || vType === 'upload') {
      hasVideo = Boolean(l.videoFile || l.videoUrl || l.videoStorageKey);
    } else {
      hasVideo = Boolean(l.youtubeVideoId || l.youtubeUrl || l.videoUrl || l.videoFile || l.videoStorageKey);
    }

    if (!hasVideo) {
      return res.status(400).json({
        success: false,
        message: `Lesson #${num} ("${l.title}") is missing a valid video source. Please configure a YouTube URL or upload a local video.`
      });
    }
  }

  course.status = 'published';
  await course.save();
  await recordAudit(req, 'publish', 'course', course._id, { title: course.title, lessonsCount: lessons.length });
  res.json({ success: true, message: 'Course published successfully.', course });
};

const handleUnpublishCourse = async (req, res) => {
  const targetId = req.params.id || req.params.courseId;
  let course = null;
  if (mongoose.Types.ObjectId.isValid(targetId)) {
    course = await Course.findById(targetId);
  }
  if (!course) {
    course = await Course.findOne({ slug: targetId });
  }
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  course.status = 'draft';
  await course.save();
  await recordAudit(req, 'unpublish', 'course', course._id, { title: course.title });
  res.json({ success: true, message: 'Course set to draft (unpublished).', course });
};

app.post(['/api/admin/courses/:id/publish', '/api/admin/courses/:courseId/publish', '/api/courses/:id/publish'], authenticateUser, requireAdmin, asyncRoute(handlePublishCourse));
app.patch(['/api/admin/courses/:id/publish', '/api/admin/courses/:courseId/publish', '/api/courses/:id/publish'], authenticateUser, requireAdmin, asyncRoute(handlePublishCourse));

app.post(['/api/admin/courses/:id/unpublish', '/api/admin/courses/:courseId/unpublish', '/api/courses/:id/unpublish'], authenticateUser, requireAdmin, asyncRoute(handleUnpublishCourse));
app.patch(['/api/admin/courses/:id/unpublish', '/api/admin/courses/:courseId/unpublish', '/api/courses/:id/unpublish'], authenticateUser, requireAdmin, asyncRoute(handleUnpublishCourse));



// -------------------------------------------------------------
// LESSONS MANAGEMENT (Requirements 3, 4, 5, 6, 7, 8, 9, 10, 11)
// -------------------------------------------------------------

// List Lessons for Course
app.get('/api/admin/courses/:courseId/lessons', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  const lessons = (course.lessons || []).map((l, idx) => {
    const lObj = l.toObject ? l.toObject() : { ...l };
    lObj.lessonNumber = lObj.lessonNumber || (idx + 1);
    lObj.order = lObj.order || (idx + 1);
    return lObj;
  });

  res.json({
    success: true,
    courseTitle: course.title,
    course: {
      _id: course._id,
      title: course.title,
      description: course.description,
      status: course.status,
      totalLessons: lessons.length
    },
    lessons
  });
}));

// Add Lesson to Course (Requirement 5, 6, 7, 9)
app.post('/api/admin/courses/:id/lessons', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  if (!req.body.title || !req.body.title.trim()) {
    return res.status(400).json({ success: false, message: 'Lesson title is required.' });
  }

  const order = req.body.order ? Number(req.body.order) : (course.lessons.length + 1);
  const lessonNumber = req.body.lessonNumber ? Number(req.body.lessonNumber) : order;

  // Check duplicate lessonNumber in same course (Requirement 9)
  const isDuplicate = course.lessons.some(l => Number(l.lessonNumber) === lessonNumber || Number(l.order) === lessonNumber);
  if (isDuplicate) {
    return res.status(400).json({
      success: false,
      message: `Lesson number ${lessonNumber} already exists in this course. Please choose a unique lesson number.`
    });
  }

  const isDraft = req.body.status === 'draft' || req.body.isPublished === false;
  const rawVType = (req.body.videoType || '').toLowerCase();
  const videoType = ['local', 'url', 'external'].includes(rawVType) ? rawVType : 'youtube';

  let youtubeVideoId = '';
  let videoUrl = '';
  let videoFile = '';

  if (videoType === 'youtube') {
    youtubeVideoId = extractYtId(req.body.youtubeVideoId || req.body.videoUrl);
    if (!youtubeVideoId && !isDraft) {
      return res.status(400).json({
        success: false,
        message: 'A valid YouTube video URL or Video ID is required for YouTube lessons.'
      });
    }
    videoUrl = youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : (req.body.videoUrl || '');
  } else if (videoType === 'url' || videoType === 'external') {
    videoUrl = req.body.videoUrl || req.body.videoFile || '';
    if (!videoUrl && !isDraft) {
      return res.status(400).json({
        success: false,
        message: 'A video URL is required for external video lessons.'
      });
    }
  } else {
    // Local Video
    videoFile = req.body.videoFile || req.body.videoUrl || '';
    if (!videoFile && !isDraft) {
      return res.status(400).json({
        success: false,
        message: 'A video file reference is required for local uploaded video lessons.'
      });
    }
    videoUrl = videoFile;
  }

  const parseObjectives = val => {
    if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
    if (typeof val === 'string' && val.trim()) {
      return val.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  const objectives = parseObjectives(req.body.learningObjectives || req.body.objectives);

  const lessonData = {
    title: req.body.title.trim(),
    description: req.body.description ? req.body.description.trim() : '',
    content: req.body.content || '',
    videoType,
    youtubeVideoId,
    videoUrl,
    videoFile,
    duration: req.body.duration ? req.body.duration.trim() : '20 mins',
    xp: Number(req.body.xp || 50),
    learningObjectives: objectives,
    objectives,
    order,
    lessonNumber,
    isPublished: !isDraft,
    status: isDraft ? 'inactive' : 'active'
  };

  course.lessons.push(lessonData);
  course.totalLessons = course.lessons.length;
  await course.save();

  const createdSubdoc = course.lessons[course.lessons.length - 1];

  // Also create in Lesson collection for synchronization
  await Lesson.create({
    _id: createdSubdoc._id,
    courseId: course._id,
    order,
    lessonNumber,
    title: lessonData.title,
    description: lessonData.description,
    content: lessonData.content,
    videoType: lessonData.videoType,
    youtubeVideoId: lessonData.youtubeVideoId,
    videoUrl: lessonData.videoUrl,
    videoFile: lessonData.videoFile,
    duration: lessonData.duration,
    xp: lessonData.xp,
    learningObjectives: lessonData.learningObjectives,
    objectives: lessonData.objectives,
    isPublished: lessonData.isPublished,
    status: lessonData.status
  }).catch(() => {});

  await recordAudit(req, 'add_lesson', 'course', course._id, { lessonId: createdSubdoc._id, title: lessonData.title });

  res.status(201).json({
    success: true,
    message: 'Lesson created successfully.',
    lesson: createdSubdoc,
    lessons: course.lessons
  });
}));

// Edit Lesson (Requirement 10 & 8: Supports both /courses/:courseId/lessons/:lessonId and /lessons/:lessonId)
const handleEditLesson = asyncRoute(async (req, res) => {
  const lessonId = req.params.lessonId;
  const courseId = req.params.courseId || req.params.id;

  let course = null;
  if (courseId) {
    course = await Course.findById(courseId);
  }
  if (!course) {
    course = await Course.findOne({ 'lessons._id': lessonId });
  }
  if (!course) return res.status(404).json({ success: false, message: 'Lesson or Course not found.' });

  const lesson = course.lessons.id(lessonId);
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found in course.' });

  const parseObjectives = val => {
    if (Array.isArray(val)) return val.map(s => String(s).trim()).filter(Boolean);
    if (typeof val === 'string' && val.trim()) {
      return val.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  // Track old local video for switching cleanup (Requirement 8)
  const oldLocalVideo = (lesson.videoType === 'local' || lesson.videoFile) ? (lesson.videoFile || lesson.videoUrl) : '';

  if (req.body.title !== undefined) lesson.title = req.body.title.trim();
  if (req.body.description !== undefined) lesson.description = req.body.description.trim();
  if (req.body.duration !== undefined) lesson.duration = req.body.duration.trim();
  if (req.body.xp !== undefined) lesson.xp = Number(req.body.xp);
  if (req.body.lessonNumber !== undefined) {
    lesson.lessonNumber = Number(req.body.lessonNumber);
    lesson.order = Number(req.body.lessonNumber);
  }
  if (req.body.order !== undefined) {
    lesson.order = Number(req.body.order);
    if (req.body.lessonNumber === undefined) lesson.lessonNumber = Number(req.body.order);
  }
  if (req.body.learningObjectives !== undefined || req.body.objectives !== undefined) {
    const list = parseObjectives(req.body.learningObjectives || req.body.objectives);
    lesson.learningObjectives = list;
    lesson.objectives = list;
  }
  if (req.body.isPublished !== undefined) {
    lesson.isPublished = Boolean(req.body.isPublished);
    lesson.status = lesson.isPublished ? 'active' : 'inactive';
  }
  if (req.body.status !== undefined) {
    lesson.status = req.body.status;
    lesson.isPublished = req.body.status !== 'draft' && req.body.status !== 'inactive';
  }

  // Handle Video Source Switching (Requirement 8)
  let videoChanged = false;
  if (req.body.videoType !== undefined) {
    const rawNew = req.body.videoType.toLowerCase();
    const newVType = ['local', 'url', 'external'].includes(rawNew) ? rawNew : 'youtube';
    lesson.videoType = newVType;

    if (newVType === 'youtube') {
      const newYtId = extractYtId(req.body.youtubeVideoId || req.body.videoUrl);
      lesson.youtubeVideoId = newYtId;
      lesson.videoUrl = newYtId ? `https://www.youtube.com/watch?v=${newYtId}` : (req.body.videoUrl || '');
      lesson.videoFile = '';
      videoChanged = true;
    } else if (newVType === 'url' || newVType === 'external') {
      lesson.videoUrl = req.body.videoUrl || req.body.videoFile || '';
      lesson.videoFile = '';
      lesson.youtubeVideoId = '';
      videoChanged = true;
    } else {
      // Local
      const newFile = req.body.videoFile || req.body.videoUrl || '';
      lesson.videoFile = newFile;
      lesson.videoUrl = newFile;
      lesson.youtubeVideoId = '';
      videoChanged = true;
    }
  } else {
    if (req.body.youtubeVideoId !== undefined || req.body.videoUrl !== undefined) {
      if (lesson.videoType === 'youtube') {
        lesson.youtubeVideoId = extractYtId(req.body.youtubeVideoId || req.body.videoUrl);
        lesson.videoUrl = lesson.youtubeVideoId ? `https://www.youtube.com/watch?v=${lesson.youtubeVideoId}` : req.body.videoUrl;
      } else {
        lesson.videoUrl = req.body.videoUrl;
        if (req.body.videoFile === undefined) lesson.videoFile = req.body.videoUrl;
      }
    }
    if (req.body.videoFile !== undefined) {
      lesson.videoFile = req.body.videoFile;
      if (lesson.videoType === 'local') lesson.videoUrl = req.body.videoFile;
    }
  }

  await course.save();

  // Sync with standalone Lesson model
  await Lesson.findByIdAndUpdate(lesson._id, {
    title: lesson.title,
    description: lesson.description,
    duration: lesson.duration,
    xp: lesson.xp,
    lessonNumber: lesson.lessonNumber,
    order: lesson.order,
    learningObjectives: lesson.learningObjectives,
    objectives: lesson.objectives,
    videoType: lesson.videoType,
    youtubeVideoId: lesson.youtubeVideoId,
    videoUrl: lesson.videoUrl,
    videoFile: lesson.videoFile,
    isPublished: lesson.isPublished,
    status: lesson.status
  }, { upsert: true }).catch(() => {});

  // Clean up old local video if source changed and no longer referenced (Requirement 8)
  if (videoChanged && oldLocalVideo && oldLocalVideo !== lesson.videoFile) {
    await safeDeleteLocalVideo(oldLocalVideo);
  }

  await recordAudit(req, 'edit_lesson', 'lesson', lesson._id, { title: lesson.title });

  res.json({
    success: true,
    message: 'Lesson updated successfully.',
    lesson,
    course
  });
});

app.put('/api/admin/courses/:courseId/lessons/:lessonId', authenticateUser, requireAdmin, handleEditLesson);
app.put('/api/admin/lessons/:lessonId', authenticateUser, requireAdmin, handleEditLesson);

// Delete Lesson Permanently (Requirement 11: Supports both route patterns)
const handleDeleteLesson = asyncRoute(async (req, res) => {
  const lessonId = req.params.lessonId;
  const courseId = req.params.courseId || req.params.id;

  let course = null;
  if (courseId) {
    course = await Course.findById(courseId);
  }
  if (!course) {
    course = await Course.findOne({ 'lessons._id': lessonId });
  }
  if (!course) return res.status(404).json({ success: false, message: 'Lesson or Course not found.' });

  const lesson = course.lessons.id(lessonId);
  if (!lesson) return res.status(404).json({ success: false, message: 'Lesson not found in course.' });

  const lessonTitle = lesson.title;
  const lessonNum = lesson.lessonNumber || lesson.order;
  const oldLocalVideo = lesson.videoFile || (lesson.videoType === 'local' ? lesson.videoUrl : '');

  // 1. Remove lesson from course.lessons
  course.lessons.pull({ _id: lessonId });

  // 2. Re-sequence remaining lessons order and lessonNumber (1..N) (Requirement 11)
  course.lessons.forEach((l, idx) => {
    l.order = idx + 1;
    l.lessonNumber = idx + 1;
  });
  course.totalLessons = course.lessons.length;
  await course.save();

  // 3. Remove from Lesson collection
  await Lesson.findByIdAndDelete(lessonId).catch(() => {});

  // 4. Invalidate/remove LessonProgress for this deleted lesson
  await LessonProgress.deleteMany({
    courseId: course._id,
    $or: [{ lessonId: String(lessonId) }, { lessonId: String(lessonNum) }]
  }).catch(() => {});

  // 5. Recalculate enrollment progress for enrolled users
  const totalRemaining = Math.max(1, course.lessons.length);
  const enrollments = await CourseEnrollment.find({ courseId: course._id });
  for (const en of enrollments) {
    const updatedCompleted = (en.completedLessons || []).filter(k => k !== String(lessonNum) && k !== String(lessonId));
    en.completedLessons = updatedCompleted;
    en.progress = Math.min(100, Math.round((updatedCompleted.length / totalRemaining) * 100));
    await en.save();
  }

  // 6. Clean up unreferenced local video if safe (Requirement 11 & 8)
  if (oldLocalVideo) {
    await safeDeleteLocalVideo(oldLocalVideo);
  }

  await recordAudit(req, 'delete_lesson', 'lesson', lessonId, { title: lessonTitle, courseId: course._id });

  res.json({
    success: true,
    message: `Lesson "${lessonTitle}" permanently deleted.`,
    course,
    lessons: course.lessons
  });
});

app.delete('/api/admin/courses/:courseId/lessons/:lessonId', authenticateUser, requireAdmin, handleDeleteLesson);
app.delete('/api/admin/lessons/:lessonId', authenticateUser, requireAdmin, handleDeleteLesson);

// Upload Video For Specific Lesson (Requirement 7 & 18: POST / PUT /api/admin/lessons/:lessonId/video)
const handleLessonVideoUpload = asyncRoute(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No video file provided.' });
  }

  const lessonId = req.params.lessonId;
  const course = await Course.findOne({ 'lessons._id': lessonId });
  if (!course) {
    return res.status(404).json({ success: false, message: 'Lesson or Course not found.' });
  }

  const lesson = course.lessons.id(lessonId);
  if (!lesson) {
    return res.status(404).json({ success: false, message: 'Lesson not found.' });
  }

  const oldVideo = lesson.videoFile || (lesson.videoType === 'local' ? lesson.videoUrl : '');
  const savedVideoUrl = `/uploads/course-videos/${req.file.filename}`;

  lesson.videoType = 'local';
  lesson.videoUrl = savedVideoUrl;
  lesson.videoFile = savedVideoUrl;
  lesson.youtubeVideoId = '';

  await course.save();

  await Lesson.findByIdAndUpdate(lesson._id, {
    videoType: 'local',
    videoUrl: savedVideoUrl,
    videoFile: savedVideoUrl,
    youtubeVideoId: ''
  }).catch(() => {});

  if (oldVideo && oldVideo !== savedVideoUrl) {
    await safeDeleteLocalVideo(oldVideo);
  }

  await recordAudit(req, 'upload_video', 'lesson', lesson._id, { filename: req.file.filename });

  res.json({
    success: true,
    message: 'Video uploaded and attached to lesson successfully.',
    videoUrl: savedVideoUrl,
    videoFile: savedVideoUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

app.post('/api/admin/lessons/:lessonId/video', authenticateUser, requireAdmin, videoUpload.single('video'), handleLessonVideoUpload);
app.put('/api/admin/lessons/:lessonId/video', authenticateUser, requireAdmin, videoUpload.single('video'), handleLessonVideoUpload);

// General Admin Video Upload via Multer (Requirement 7 & 18)
app.post('/api/admin/courses/:id/lessons/upload-video', authenticateUser, requireAdmin, videoUpload.single('video'), asyncRoute(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided.' });
  const videoPath = `/uploads/course-videos/${req.file.filename}`;
  res.json({
    success: true,
    message: 'Video file uploaded successfully.',
    videoUrl: videoPath,
    videoFile: videoPath,
    filename: req.file.filename,
    size: req.file.size
  });
}));

app.post('/api/admin/upload-video', authenticateUser, requireAdmin, videoUpload.single('video'), asyncRoute(async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No video file provided.' });
  const videoPath = `/uploads/course-videos/${req.file.filename}`;
  res.json({
    success: true,
    message: 'Video file uploaded successfully.',
    videoUrl: videoPath,
    videoFile: videoPath,
    filename: req.file.filename,
    size: req.file.size
  });
}));

// Reorder Lessons (Requirement 4 & 18)
app.put('/api/admin/courses/:id/reorder-lessons', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  const { lessonIds } = req.body;
  if (!Array.isArray(lessonIds) || !lessonIds.length) {
    return res.status(400).json({ success: false, message: 'lessonIds array is required.' });
  }

  const reordered = [];
  lessonIds.forEach((id, idx) => {
    const l = course.lessons.id(id);
    if (l) {
      l.order = idx + 1;
      l.lessonNumber = idx + 1;
      reordered.push(l);
    }
  });

  // Include any lessons that weren't in the array at the end
  course.lessons.forEach(l => {
    if (!lessonIds.includes(String(l._id))) {
      l.order = reordered.length + 1;
      l.lessonNumber = reordered.length + 1;
      reordered.push(l);
    }
  });

  course.lessons = reordered;
  await course.save();

  // Sync orders with Lesson collection
  for (const l of reordered) {
    await Lesson.findByIdAndUpdate(l._id, { order: l.order, lessonNumber: l.lessonNumber }).catch(() => {});
  }

  await recordAudit(req, 'reorder_lessons', 'course', course._id, { count: reordered.length });

  res.json({
    success: true,
    message: 'Lessons reordered successfully.',
    lessons: course.lessons
  });
}));

// Admin Course Quiz Management
app.get('/api/admin/courses/:id/quiz', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  const quiz = await Quiz.findOne({ courseId: course._id });
  res.json({ success: true, courseTitle: course.title, quiz });
}));

app.post('/api/admin/courses/:id/quiz', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

  const { title, passPercentage = 70, questions = [] } = req.body;
  const quiz = await Quiz.findOneAndUpdate(
    { courseId: course._id },
    {
      courseId: course._id,
      title: title || `${course.title} Final Quiz`,
      passPercentage: Number(passPercentage) || 70,
      questions
    },
    { upsert: true, new: true, runValidators: true }
  );

  await recordAudit(req, 'update_quiz', 'course', course._id, { questionsCount: questions.length });
  res.json({ success: true, message: 'Course quiz updated successfully.', quiz });
}));

app.delete('/api/admin/courses/:id/quiz', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  await Quiz.findOneAndDelete({ courseId: req.params.id });
  await recordAudit(req, 'delete_quiz', 'course', req.params.id);
  res.json({ success: true, message: 'Quiz deleted successfully.' });
}));

// Admin Course Registrations List
app.get('/api/admin/course-registrations', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const enrollments = await CourseEnrollment.find()
    .populate('studentId', 'fullName email department institution college userType registerNumber')
    .populate('courseId', 'title category duration')
    .sort({ createdAt: -1 });

  res.json({ success: true, enrollments, registrations: enrollments });
}));

// Admin Companies CRUD
app.get('/api/admin/companies', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const companies = await Company.find().sort({ name: 1 });
  res.json({ success: true, companies });
}));

app.post('/api/admin/companies', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const company = await Company.create(req.body);
  await recordAudit(req, 'create', 'company', company._id, { name: company.name });
  res.status(201).json({ success: true, company });
}));

app.put('/api/admin/companies/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
  await recordAudit(req, 'update', 'company', company._id);
  res.json({ success: true, company });
}));

app.delete('/api/admin/companies/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) return res.status(404).json({ success: false, message: 'Company not found.' });
  await recordAudit(req, 'delete', 'company', company._id);
  res.json({ success: true, message: 'Company deleted.' });
}));

// Admin Company Documents CRUD
app.get('/api/admin/company-documents', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const filter = {};
  if (req.query.companyId && mongoose.Types.ObjectId.isValid(req.query.companyId)) {
    filter.companyId = req.query.companyId;
  }
  const documents = await CompanyDocument.find(filter).populate('companyId', 'name').sort({ createdAt: -1 });
  res.json({ success: true, documents });
}));

app.post('/api/admin/company-documents', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const { companyId, title, fileUrl, fileName, documentType, description } = req.body;
  if (!companyId || !fileUrl) {
    return res.status(400).json({ success: false, message: 'companyId and fileUrl are required.' });
  }
  const doc = await CompanyDocument.create({
    companyId,
    title: title || 'Company Document',
    fileUrl,
    fileName: fileName || 'document.pdf',
    documentType: documentType || 'Company Profile PDF',
    description: description || '',
    uploadedBy: req.user._id,
    status: 'active'
  });
  if (!documentType || documentType.includes('Profile')) {
    await Company.findByIdAndUpdate(companyId, { profilePdfUrl: fileUrl });
  }
  await recordAudit(req, 'create', 'company_document', doc._id, { title: doc.title });
  res.status(201).json({ success: true, document: doc });
}));

app.delete('/api/admin/company-documents/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const doc = await CompanyDocument.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ success: false, message: 'Document not found.' });
  await recordAudit(req, 'delete', 'company_document', doc._id);
  res.json({ success: true, message: 'Document removed successfully.' });
}));

// Admin Internships CRUD
app.get('/api/admin/internships', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const internships = await Internship.find().populate('companyId').sort({ createdAt: -1 });
  res.json({ success: true, internships });
}));

app.post('/api/admin/internships', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const internship = await Internship.create(req.body);
  await recordAudit(req, 'create', 'internship', internship._id, { title: internship.title });
  res.status(201).json({ success: true, internship });
}));

app.put('/api/admin/internships/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const internship = await Internship.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' });
  await recordAudit(req, 'update', 'internship', internship._id);
  res.json({ success: true, internship });
}));

app.delete('/api/admin/internships/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const internship = await Internship.findByIdAndDelete(req.params.id);
  if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' });
  await recordAudit(req, 'delete', 'internship', internship._id);
  res.json({ success: true, message: 'Internship deleted.' });
}));

// Admin Toggle Verified Listing
app.put('/api/admin/internships/:id/verify', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const internship = await Internship.findById(req.params.id);
  if (!internship) return res.status(404).json({ success: false, message: 'Internship not found.' });

  const newVerified = typeof req.body.isVerified !== 'undefined' ? Boolean(req.body.isVerified) : !internship.isVerified;
  internship.isVerified = newVerified;
  internship.verificationDate = newVerified ? new Date() : null;
  internship.source = newVerified ? 'Platform Administrator Verified' : 'Community Submission';
  await internship.save();

  await recordAudit(req, 'verify_internship', 'internship', internship._id, { isVerified: newVerified });
  res.json({
    success: true,
    message: `Internship listing marked as ${newVerified ? 'Verified' : 'Unverified'}.`,
    internship
  });
}));

// Admin Internship Applications View & Status Update
app.get('/api/admin/internship-applications', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const applications = await InternshipApplication.find()
    .populate('studentId', 'fullName email department institution college userType registerNumber phone')
    .populate('internshipId', 'title company location fee type isVerified status')
    .sort({ createdAt: -1 });

  res.json({ success: true, applications, registrations: applications });
}));

const handleAppStatusUpdate = asyncRoute(async (req, res) => {
  const { status, notes, adminNotes } = req.body;
  const allowed = [
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
  ];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${allowed.join(', ')}` });
  }

  const updateFields = { status };
  const noteText = notes || adminNotes || '';
  if (noteText) updateFields.adminNotes = noteText;

  let application = await InternshipApplication.findById(req.params.id);
  if (application) {
    application.status = status;
    if (noteText) application.adminNotes = noteText;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      note: noteText,
      changedBy: req.user.fullName || 'Admin'
    });
    await application.save();
  }

  let registration = await InternshipRegistration.findByIdAndUpdate(
    req.params.id,
    updateFields,
    { new: true }
  );

  if (!application && !registration) {
    return res.status(404).json({ success: false, message: 'Application not found.' });
  }

  // Keep both in sync
  if (registration && !application) {
    await InternshipApplication.findOneAndUpdate(
      { studentId: registration.studentId, internshipId: registration.internshipId },
      { status, adminNotes: noteText }
    );
  }

  await recordAudit(req, 'update_status', 'internship_application', req.params.id, { status, note: noteText });
  res.json({
    success: true,
    message: `Application status updated to "${status}"`,
    application: application || registration
  });
});

app.put('/api/admin/internship-applications/:id/status', authenticateUser, requireAdmin, handleAppStatusUpdate);
app.patch('/api/admin/internship-applications/:id/status', authenticateUser, requireAdmin, handleAppStatusUpdate);

// Admin Events CRUD
app.get('/api/admin/events', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const events = await Event.find().populate('participants', 'fullName email department').sort({ date: 1 });
  res.json({ success: true, events });
}));

app.post('/api/admin/events', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const event = await Event.create(req.body);
  await recordAudit(req, 'create', 'event', event._id, { title: event.title });
  res.status(201).json({ success: true, event });
}));

app.put('/api/admin/events/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  await recordAudit(req, 'update', 'event', event._id);
  res.json({ success: true, event });
}));

app.delete('/api/admin/events/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const event = await Event.findByIdAndDelete(req.params.id);
  if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
  await recordAudit(req, 'delete', 'event', event._id);
  res.json({ success: true, message: 'Event deleted.' });
}));

// Admin Games CRUD
app.get('/api/admin/games', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const games = await Game.find().sort({ createdAt: -1 }).lean();
  const gamesWithStats = await Promise.all(games.map(async game => {
    const [questionCount, completionCount] = await Promise.all([
      GameQuestion.countDocuments({ gameId: game._id, isActive: true }),
      GameResult.countDocuments({ gameId: game._id, status: { $ne: 'in-progress' } })
    ]);
    return { ...game, questionCount, completionCount };
  }));
  res.json({ success: true, games: gamesWithStats });
}));

app.post('/api/admin/games', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const game = await Game.create(req.body);
  await recordAudit(req, 'create', 'game', game._id, { title: game.title });
  res.status(201).json({ success: true, game });
}));

app.put('/api/admin/games/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!game) return res.status(404).json({ success: false, message: 'Game not found.' });
  await recordAudit(req, 'update', 'game', game._id);
  res.json({ success: true, game });
}));

app.delete('/api/admin/games/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const game = await Game.findByIdAndDelete(req.params.id);
  if (!game) return res.status(404).json({ success: false, message: 'Game not found.' });
  await recordAudit(req, 'delete', 'game', game._id);
  res.json({ success: true, message: 'Game deleted.' });
}));

// Admin Game Questions CRUD
app.get('/api/admin/game-questions', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const filter = {};
  if (req.query.gameId && mongoose.Types.ObjectId.isValid(req.query.gameId)) {
    filter.gameId = req.query.gameId;
  }
  const questions = await GameQuestion.find(filter).populate('gameId', 'title gameType').sort({ level: 1, createdAt: 1 });
  res.json({ success: true, questions });
}));

app.post('/api/admin/game-questions', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const question = await GameQuestion.create(req.body);
  await recordAudit(req, 'create', 'game_question', question._id, { question: question.question });
  res.status(201).json({ success: true, question });
}));

app.put('/api/admin/game-questions/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const question = await GameQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });
  await recordAudit(req, 'update', 'game_question', question._id);
  res.json({ success: true, question });
}));

app.delete('/api/admin/game-questions/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const question = await GameQuestion.findByIdAndDelete(req.params.id);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found.' });
  await recordAudit(req, 'delete', 'game_question', question._id);
  res.json({ success: true, message: 'Question removed.' });
}));

// Admin Certificates View
app.get('/api/admin/certificates', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const certificates = await Certificate.find()
    .populate('user', 'fullName email department registerNumber')
    .populate('course', 'title category')
    .sort({ createdAt: -1 });
  res.json({ success: true, certificates });
}));

app.delete('/api/admin/certificates/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const cert = await Certificate.findByIdAndDelete(req.params.id);
  if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found.' });
  await recordAudit(req, 'delete', 'certificate', cert._id);
  res.json({ success: true, message: 'Certificate removed.' });
}));

// Admin Clubs CRUD
app.get('/api/admin/clubs', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const clubs = await Club.find().populate('leader', 'fullName email').populate('members', 'fullName email');
  res.json({ success: true, clubs });
}));

app.post('/api/admin/clubs', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const club = await Club.create(req.body);
  await recordAudit(req, 'create', 'club', club._id);
  res.status(201).json({ success: true, club });
}));

app.put('/api/admin/clubs/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const club = await Club.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });
  await recordAudit(req, 'update', 'club', club._id);
  res.json({ success: true, club });
}));

app.delete('/api/admin/clubs/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const club = await Club.findByIdAndDelete(req.params.id);
  if (!club) return res.status(404).json({ success: false, message: 'Club not found.' });
  await recordAudit(req, 'delete', 'club', club._id);
  res.json({ success: true, message: 'Club deleted.' });
}));

// Admin Messages
app.get('/api/admin/messages', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const messages = await Message.find()
    .populate('sender receiver', 'fullName email department')
    .sort({ createdAt: -1 });
  res.json({ success: true, messages });
}));

app.delete('/api/admin/messages/:id', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  await Message.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Message removed.' });
}));

// Admin Audit Logs & Activity
app.get('/api/admin/audit-logs', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const logs = await AuditLog.find().populate('admin', 'fullName email').sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, logs });
}));

app.get('/api/admin/user-activity', authenticateUser, requireAdmin, asyncRoute(async (req, res) => {
  const activities = await UserActivity.find().sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, activities });
}));

// ==========================================
// 16. CLIENT ROUTE FALLBACK & 404
// ==========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'home.html'));
});

app.get(['/admin', '/admin/', '/admin/dashboard', '/admin/dashboard.html'], (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin-dashboard.html'));
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ success: false, message: `API route not found: ${req.method} ${req.path}` });
  }
  // Try sending matching HTML file from frontend
  const cleanPath = req.path.replace(/^\//, '');
  if (cleanPath.endsWith('.html')) {
    return res.sendFile(path.join(frontendPath, cleanPath), err => {
      if (err) res.status(404).sendFile(path.join(frontendPath, 'home.html'));
    });
  }
  next();
});

// Central error handler
app.use((error, req, res, next) => {
  console.error('[SERVER ERROR]:', error);
  const status = error.code === 'LIMIT_FILE_SIZE'
    ? 413
    : error.message && error.message.startsWith('Only video files')
      ? 400
      : error.status || error.statusCode || 500;
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' && status === 500
      ? 'An unexpected server error occurred.'
      : error.code === 'LIMIT_FILE_SIZE'
        ? 'Video file exceeds the 250 MB upload limit.'
        : error.message
  });
});

// ==========================================
// 17. SERVER STARTUP
// ==========================================
const port = process.env.PORT || 5000;

if (require.main === module) {
  connectDatabase()
    .then(async () => {
      await ensureDefaultAccounts();

      const server = app.listen(port, () => {
        console.log(`===============================================`);
        console.log(`🚀 EDUTECH NEXUS Server running on port ${port}`);
        console.log(`-----------------------------------------------`);
        console.log(`🏠 Home Page:       http://localhost:${port}/home.html`);
        console.log(`👤 User Login:      http://localhost:${port}/login.html`);
        console.log(`🔐 Admin Login:     http://localhost:${port}/admin-login.html`);
        console.log(`⚡ Admin Dashboard: http://localhost:${port}/admin-dashboard.html`);
        console.log(`📡 API Base:        http://localhost:${port}/api`);
        console.log(`-----------------------------------------------`);
        console.log(`🔐 ADMIN ACCOUNT:`);
        console.log(`   Username: admin`);
        console.log(`   Email:    adminedutech001@gmail.com`);
        console.log(`   Password: configured with ADMIN_PASSWORD in backend/.env`);
        console.log(`-----------------------------------------------`);
        console.log(`👤 STUDENT / USER ACCOUNT:`);
        console.log(`   Username: student`);
        console.log(`   Email:    student@edutechnexus.com`);
        console.log(`   Password: configured with STUDENT_PASSWORD in backend/.env`);
        console.log(`===============================================`);
      });

      server.on('error', error => {
        if (error.code === 'EADDRINUSE') {
          console.log(`⚠️ Port ${port} is already in use. Server is likely already running.`);
          process.exit(0);
        }
        console.error('API startup error:', error.message);
        process.exit(1);
      });
    })
    .catch(error => {
      console.error('Database connection failed:', error.message);
      process.exit(1);
    });
}

module.exports = app;
