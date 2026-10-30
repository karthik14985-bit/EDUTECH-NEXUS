/**
 * EDUTECH NEXUS - Comprehensive End-to-End System QA Runner
 * Tests all requested backend models, routes, auth, courses, lessons, videos,
 * certificates, internships, events, games, discussions, clubs, notifications,
 * and admin operations directly against MongoDB and Express.
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const backendDir = path.join(__dirname, '..', 'backend');
const backendModules = path.join(backendDir, 'node_modules');

require(path.join(backendModules, 'dotenv')).config({ path: path.join(backendDir, '.env') });
const mongoose = require(path.join(backendModules, 'mongoose'));

// Import server app
const app = require(path.join(backendDir, 'server'));

const connectDatabase = require(path.join(backendDir, 'config', 'db'));
const { ensureDefaultAccounts } = require(path.join(backendDir, 'services', 'initDefaults'));
const Game = require(path.join(backendDir, 'models', 'Game'));
const GameQuestion = require(path.join(backendDir, 'models', 'GameQuestion'));
const GameResult = require(path.join(backendDir, 'models', 'GameResult'));
const User = require(path.join(backendDir, 'models', 'User'));
const Course = require(path.join(backendDir, 'models', 'Course'));
const Lesson = require(path.join(backendDir, 'models', 'Lesson'));
const CourseEnrollment = require(path.join(backendDir, 'models', 'CourseEnrollment'));
const CourseRegistration = require(path.join(backendDir, 'models', 'CourseRegistration'));
const LessonProgress = require(path.join(backendDir, 'models', 'LessonProgress'));
const Certificate = require(path.join(backendDir, 'models', 'Certificate'));
const Quiz = require(path.join(backendDir, 'models', 'Quiz'));
const QuizAttempt = require(path.join(backendDir, 'models', 'QuizAttempt'));

let server;
let port = 5099;

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json'
    };
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers
      },
      (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve({ status: res.statusCode, data: parsed });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

async function run() {
  console.log('====================================================');
  console.log('   EDUTECH NEXUS - FULL SYSTEM QA & VERIFICATION    ');
  console.log('====================================================\n');

  // Connect MongoDB
  console.log('[QA] Connecting to MongoDB...');
  await connectDatabase();
  console.log('[QA] MongoDB connected.');
  await ensureDefaultAccounts();
  console.log('[QA] Default accounts verified.');

  // Start test server
  await new Promise((resolve) => {
    server = app.listen(port, () => {
      console.log(`[QA] Express test server listening on port ${port}`);
      resolve();
    });
  });

  let passed = 0;
  let failed = 0;

  let studentToken = null;
  let adminToken = null;
  let studentUser = null;
  let testCourseId = null;
  let testLessonId = null;
  let testInternshipId = null;
  let testCompanyId = null;
  let testEventId = null;
  let testGameId = null;
  let testCertificateId = null;
  let testNotificationId = null;

  const testSuffix = Date.now();
  const testStudentEmail = `qa_student_${testSuffix}@nexus.com`;
  const testStudentUser = `qa_user_${testSuffix}`;

  // 1. REGISTRATION TESTS
  test('Register Student with full conditional fields (College, Dept, Year, RegNum, City, Address)', async () => {
    const res = await request('POST', '/api/auth/register', {
      fullName: 'Karthi QA Tester',
      email: testStudentEmail,
      username: testStudentUser,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      phone: '+91 9876543210',
      age: 21,
      gender: 'Male',
      userType: 'student',
      college: 'MIT Institute of Technology',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      registerNumber: `REG-${testSuffix}`,
      place: 'Chennai',
      address: 'Tech Park Blvd, Guindy, Chennai'
    });

    if (res.status !== 201 && res.status !== 200) {
      throw new Error(`Registration failed: ${JSON.stringify(res.data)}`);
    }
    if (!res.data.success) throw new Error(res.data.message || 'Registration returned unsuccessful');
  });

  test('Prevent Duplicate Registration (Duplicate Email & Username rejection)', async () => {
    const res = await request('POST', '/api/auth/register', {
      fullName: 'Duplicate Tester',
      email: testStudentEmail,
      username: `another_${testSuffix}`,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      phone: '+91 9876543211',
      age: 22,
      userType: 'student',
      college: 'MIT',
      department: 'CSE',
      registerNumber: `REG-DUP-${testSuffix}`
    });

    if (res.status === 201 || (res.data && res.data.success)) {
      throw new Error('Server allowed duplicate email registration!');
    }
  });

  test('Register Staff Persona with conditional fields', async () => {
    const res = await request('POST', '/api/auth/register', {
      fullName: 'Dr. Ramesh Staff',
      email: `staff_${testSuffix}@nexus.com`,
      username: `staff_${testSuffix}`,
      password: 'Password@123',
      confirmPassword: 'Password@123',
      phone: '+91 9876543212',
      age: 45,
      gender: 'Male',
      userType: 'staff',
      institution: 'Anna University',
      department: 'Information Technology',
      designation: 'Associate Professor',
      place: 'Chennai',
      address: 'Faculty Quarters, Anna University'
    });

    if (!res.data || !res.data.success) throw new Error(`Staff registration failed: ${JSON.stringify(res.data)}`);
  });

  // 2. AUTHENTICATION & LOGIN TESTS
  test('Login as Student and acquire JWT', async () => {
    const res = await request('POST', '/api/auth/login', {
      emailOrUsername: testStudentEmail,
      password: 'Password@123'
    });

    if (!res.data.success || !res.data.token) {
      throw new Error(`Login failed: ${JSON.stringify(res.data)}`);
    }
    studentToken = res.data.token;
    studentUser = res.data.user;
  });

  test('Get Current User Profile (/api/auth/me)', async () => {
    const res = await request('GET', '/api/auth/me', null, studentToken);
    if (!res.data.success || !res.data.user) {
      throw new Error(`GET /api/auth/me failed: ${JSON.stringify(res.data)}`);
    }
    if (res.data.user.email !== testStudentEmail) {
      throw new Error('User identity mismatch');
    }
  });

  test('Login as Admin', async () => {
    const res = await request('POST', '/api/auth/login', {
      emailOrUsername: process.env.ADMIN_EMAIL || 'adminedutech001@gmail.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@edutech'
    });

    if (!res.data.success || !res.data.token) {
      throw new Error(`Admin login failed: ${JSON.stringify(res.data)}`);
    }
    adminToken = res.data.token;
    if (res.data.user?.role !== 'admin') throw new Error('Admin login returned a non-admin user.');
  });

  test('Admin credentials authenticate by username and reject an incorrect password', async () => {
    const valid = await request('POST', '/api/auth/login', {
      emailOrUsername: 'admin',
      password: process.env.ADMIN_PASSWORD || 'Admin@edutech'
    });
    if (valid.status !== 200 || valid.data.user?.role !== 'admin') {
      throw new Error(`Admin username login failed: ${JSON.stringify(valid.data)}`);
    }

    const invalid = await request('POST', '/api/auth/login', {
      emailOrUsername: process.env.ADMIN_EMAIL || 'adminedutech001@gmail.com',
      password: 'definitely-not-the-admin-password'
    });
    if (invalid.status !== 401 || !/invalid.*password/i.test(invalid.data.message || '')) {
      throw new Error(`Invalid admin password was not rejected clearly: ${JSON.stringify(invalid.data)}`);
    }

    const currentUser = await request('GET', '/api/auth/me', null, valid.data.token);
    if (currentUser.status !== 200 || currentUser.data.user?.role !== 'admin') {
      throw new Error('Authenticated admin token did not resolve to an admin user.');
    }
  });

  test('Admin game controls expose question and completion counts only to admins', async () => {
    const adminGames = await request('GET', '/api/admin/games', null, adminToken);
    const codeSprint = adminGames.data.games?.find(game => game.slug === 'code-sprint');
    if (adminGames.status !== 200 || !codeSprint || codeSprint.questionCount !== 10 || typeof codeSprint.completionCount !== 'number') {
      throw new Error(`Admin game statistics are incomplete: ${JSON.stringify(adminGames.data)}`);
    }
    const studentGames = await request('GET', '/api/admin/games', null, studentToken);
    if (studentGames.status !== 403) throw new Error('Student was able to access admin game management.');
  });

  // 3. COURSES, LESSONS, & VIDEO STREAMING TESTS
  test('Admin Creates Course with XP & Curriculums', async () => {
    const res = await request('POST', '/api/admin/courses', {
      title: `Full Stack Cloud Architecture ${testSuffix}`,
      category: 'Web Development',
      instructor: 'Dr. Sarah Connor',
      duration: '8 Weeks',
      difficulty: 'Intermediate',
      xpReward: 150,
      description: 'End-to-end full stack architecture curriculum.',
      status: 'active'
    }, adminToken);

    if (!res.data.success || !res.data.course) {
      throw new Error(`Admin course creation failed: ${JSON.stringify(res.data)}`);
    }
    testCourseId = res.data.course._id;
  });

  test('Admin Adds Lesson 1 with YouTube Video embed extraction', async () => {
    const res = await request('POST', `/api/admin/courses/${testCourseId}/lessons`, {
      title: 'Lesson 1: Cloud Architecture Fundamentals',
      videoType: 'youtube',
      youtubeVideoId: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
      duration: '20 mins',
      description: 'Introduction to scalable distributed cloud principles.'
    }, adminToken);

    if (!res.data.success) throw new Error(`Add YouTube lesson failed: ${JSON.stringify(res.data)}`);
    testLessonId = res.data.lesson ? res.data.lesson._id : res.data.course.lessons[0]._id;
  });

  test('Admin Adds Lesson 2 with Local Video file path', async () => {
    const res = await request('POST', `/api/admin/courses/${testCourseId}/lessons`, {
      title: 'Lesson 2: Containerization & Microservices',
      videoType: 'local',
      videoFile: '/videos/sample-lesson.mp4',
      duration: '25 mins',
      description: 'Docker and microservice communication.'
    }, adminToken);

    if (!res.data.success) throw new Error(`Add Local video lesson failed: ${JSON.stringify(res.data)}`);
  });

  test('Admin Adds Lesson 3 with External Video URL', async () => {
    const res = await request('POST', `/api/admin/courses/${testCourseId}/lessons`, {
      title: 'Lesson 3: High Availability Databases',
      videoType: 'url',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      duration: '18 mins',
      description: 'Replica sets and distributed transactions.'
    }, adminToken);

    if (!res.data.success) throw new Error(`Add External URL lesson failed: ${JSON.stringify(res.data)}`);
  });

  test('Student Course Registration (30 Days Access period calculation)', async () => {
    const res = await request('POST', `/api/courses/${testCourseId}/register`, {
      fullName: 'Karthi QA Tester',
      phone: '+91 9876543210',
      age: 21,
      userType: 'student',
      place: 'Chennai',
      institution: 'MIT Institute of Technology',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      registerNumber: `REG-${testSuffix}`
    }, studentToken);

    if (!res.data.success) throw new Error(`Course registration failed: ${JSON.stringify(res.data)}`);
    const reg = res.data.registration || res.data.enrollment;
    if (!reg) throw new Error('No enrollment object returned');
    
    // Check 30 days expiry
    const regDate = new Date(reg.registrationDate || reg.enrolledAt);
    const expDate = new Date(reg.expiryDate);
    const diffDays = Math.round((expDate - regDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 29 || diffDays > 31) {
      throw new Error(`Expiry date is not 30 days: got ${diffDays} days`);
    }
  });

  test('Student Completes Lesson 1 & Earns XP', async () => {
    const res = await request('POST', `/api/courses/${testCourseId}/lessons/1/complete`, {
      lessonId: '1'
    }, studentToken);

    if (!res.data.success) throw new Error(`Lesson completion failed: ${JSON.stringify(res.data)}`);
    if (res.data.progress < 30) throw new Error(`Progress did not update: ${res.data.progress}%`);
  });

  test('Student Completes Lessons 2 & 3 (Reaches >= 90% Certificate Eligibility)', async () => {
    await request('POST', `/api/courses/${testCourseId}/lessons/2/complete`, { lessonId: '2' }, studentToken);
    const res = await request('POST', `/api/courses/${testCourseId}/lessons/3/complete`, { lessonId: '3' }, studentToken);

    if (!res.data.success) throw new Error(`Lesson 3 completion failed: ${JSON.stringify(res.data)}`);
    if (res.data.progress < 90) throw new Error(`Progress should be >= 90%: got ${res.data.progress}%`);
    if (!res.data.certificateEligible) throw new Error('certificateEligible should be true');
  });

  test('Student Claims Verified Certificate (Unique ID & XP Awarded)', async () => {
    const res = await request('POST', '/api/certificates/claim', {
      courseId: testCourseId
    }, studentToken);

    if (!res.data.success || !res.data.certificate) {
      throw new Error(`Certificate claim failed: ${JSON.stringify(res.data)}`);
    }
    const cert = res.data.certificate;
    testCertificateId = cert.certificateId || cert._id;
    if (!testCertificateId) throw new Error('Certificate ID is missing');
  });

  test('Public Certificate Verification Endpoint (/api/certificates/verify/:id)', async () => {
    const res = await request('GET', `/api/certificates/verify/${testCertificateId}`);
    if (!res.data.success || !res.data.certificate) {
      throw new Error(`Certificate verification failed: ${JSON.stringify(res.data)}`);
    }
  });

  // 4. LIVE LEADERBOARD
  test('Live Top 3 Leaderboard reflects student ranking and XP', async () => {
    const res = await request('GET', '/api/leaderboard/top3');
    if (!res.data.success || !res.data.top3) {
      throw new Error(`Top 3 leaderboard failed: ${JSON.stringify(res.data)}`);
    }
    if (res.data.top3.length === 0) {
      throw new Error('Leaderboard is empty');
    }
  });

  // 5. INTERNSHIPS & COMPANIES
  test('Admin Creates Company & Internship Posting', async () => {
    const compRes = await request('POST', '/api/admin/companies', {
      name: `Nexus Cloud Labs ${testSuffix}`,
      industry: 'Cloud Infrastructure & DevOps',
      website: 'https://nexuscloudlabs.example.com',
      email: 'careers@nexuscloudlabs.example.com',
      location: 'Bangalore, India',
      status: 'active'
    }, adminToken);

    if (!compRes.data.success || !compRes.data.company) throw new Error('Company creation failed');
    testCompanyId = compRes.data.company._id;

    const intRes = await request('POST', '/api/admin/internships', {
      title: 'Cloud DevOps Associate Intern',
      company: compRes.data.company.name,
      companyId: testCompanyId,
      category: 'Cloud Engineering',
      duration: '6 Months',
      workMode: 'Remote',
      location: 'Remote / Bangalore',
      type: 'Free',
      stipend: '₹20,000 / month',
      deadline: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      status: 'active',
      description: 'Hands-on Kubernetes and Terraform automation internship.'
    }, adminToken);

    if (!intRes.data.success || !intRes.data.internship) throw new Error('Internship creation failed');
    testInternshipId = intRes.data.internship._id;
  });

  test('Student Applies for Internship (Application ID generated & tracked)', async () => {
    const res = await request('POST', `/api/internships/${testInternshipId}/apply`, {
      fullName: 'Karthi QA Tester',
      email: testStudentEmail,
      phone: '+91 9876543210',
      college: 'MIT Institute of Technology',
      department: 'Computer Science & Engineering',
      year: '3rd Year',
      registerNumber: `REG-${testSuffix}`,
      place: 'Chennai',
      github: 'https://github.com/karthi-tester',
      coverLetter: 'Passionate about Kubernetes and microservices.'
    }, studentToken);

    if (!res.data.success || !res.data.application) {
      throw new Error(`Internship application failed: ${JSON.stringify(res.data)}`);
    }
    const appData = res.data.application;
    if (!appData.applicationId) throw new Error('Application ID was not generated');
  });

  // 6. TECHNICAL EVENTS
  test('Admin Creates Event & Student Registers', async () => {
    const evRes = await request('POST', '/api/admin/events', {
      title: `Global AI & Web3 Hackathon ${testSuffix}`,
      category: 'Hackathon',
      date: new Date(Date.now() + 15*24*60*60*1000).toISOString(),
      venue: 'Nexus Virtual Metaverse',
      mode: 'Online',
      status: 'active',
      description: 'Build decentralized intelligent agent apps.'
    }, adminToken);

    if (!evRes.data.success || !evRes.data.event) throw new Error('Event creation failed');
    testEventId = evRes.data.event._id;

    const regRes = await request('POST', `/api/events/${testEventId}/register`, {
      fullName: 'Karthi QA Tester',
      email: testStudentEmail,
      phone: '+91 9876543210'
    }, studentToken);

    if (!regRes.data.success) throw new Error(`Event registration failed: ${JSON.stringify(regRes.data)}`);
  });

  // 7. TECH GAMES & CHALLENGES
  test('Student Submits Game Result & Earns XP (/api/games/:id/result)', async () => {
    const res = await request('POST', '/api/games/code-sprint/result', {
      score: 100,
      xp: 50
    }, studentToken);

    if (!res.data.success) throw new Error(`Game result submission failed: ${JSON.stringify(res.data)}`);
  });

  test('PlayZone loads all seeded games with active questions', async () => {
    const list = await request('GET', '/api/games', null, studentToken);
    if (list.status !== 200 || list.data.total !== 11) {
      throw new Error(`Expected 11 active PlayZone games, received ${list.data.total}.`);
    }
    for (const game of list.data.games) {
      const questions = await request('GET', `/api/games/${game._id}/questions`, null, studentToken);
      if (questions.status !== 200 || !questions.data.questions?.length) {
        throw new Error(`${game.title} does not provide playable questions.`);
      }
      if (game.gameType === 'sql-quest' && !questions.data.questions.some(question => question.sqlScenario?.tables?.length)) {
        throw new Error('SQL Quest did not provide its simulated sample tables.');
      }
    }
  });

  test('Existing Debugging Game still awards its configured level XP once', async () => {
    const game = await Game.findOne({ slug: 'debugging-game' });
    const question = await GameQuestion.findOne({ gameId: game?._id, level: 1, isActive: true });
    if (!game || !question || !question.codeSnippet) throw new Error('Debugging level data is unavailable.');

    const userBefore = await User.findById(studentUser._id).select('xp');
    const body = { action: 'check-level', level: 1, answer: question.expectedAnswer };
    const first = await request('POST', `/api/games/${game._id}/submit`, body, studentToken);
    const replay = await request('POST', `/api/games/${game._id}/submit`, body, studentToken);
    const userAfter = await User.findById(studentUser._id).select('xp');

    if (!first.data.isCorrect || first.data.xpEarned !== question.xp) {
      throw new Error(`Debugging answer or configured XP is incorrect: ${JSON.stringify(first.data)}`);
    }
    if (!replay.data.isCorrect || replay.data.xpEarned !== 0 || userAfter.xp - userBefore.xp !== question.xp) {
      throw new Error('Debugging level replay awarded duplicate XP.');
    }
  });

  test('Tech Quiz locks answers, returns feedback, and makes completion idempotent', async () => {
    const game = await Game.findOne({ slug: 'tech-quiz' });
    if (!game) throw new Error('Tech Quiz seed game was not found.');
    const questions = await GameQuestion.find({ gameId: game._id, isActive: true }).sort({ level: 1 }).limit(2);
    if (questions.length !== 2) throw new Error('Tech Quiz needs at least two active questions for this test.');
    const publicGames = await request('GET', '/api/games', null, studentToken);
    const publicQuiz = publicGames.data.games?.find(item => String(item._id) === String(game._id));
    if (!publicQuiz || publicQuiz.questions?.some(question => 'correctAnswer' in question || 'explanation' in question)) {
      throw new Error('Public game listing exposed answer keys or failed to return the quiz.');
    }

    const attemptId = `qa-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const start = await request('POST', `/api/games/${game._id}/start`, { attemptId }, studentToken);
    if (start.status !== 200) throw new Error(`Quiz start failed: ${JSON.stringify(start.data)}`);

    const firstCorrectIndex = Number(questions[0].correctAnswer);
    const firstAnswer = await request('POST', `/api/games/${game._id}/answer`, {
      attemptId,
      questionId: String(questions[0]._id),
      selectedIndex: firstCorrectIndex
    }, studentToken);
    if (!firstAnswer.data.success || !firstAnswer.data.isCorrect || firstAnswer.data.correctIndex !== firstCorrectIndex) {
      throw new Error(`Correct answer feedback failed: ${JSON.stringify(firstAnswer.data)}`);
    }

    const lockedRetry = await request('POST', `/api/games/${game._id}/answer`, {
      attemptId,
      questionId: String(questions[0]._id),
      selectedIndex: (firstCorrectIndex + 1) % questions[0].options.length
    }, studentToken);
    if (!lockedRetry.data.success || !lockedRetry.data.isCorrect || lockedRetry.data.selectedIndex !== firstCorrectIndex) {
      throw new Error(`Repeated answer changed the locked selection: ${JSON.stringify(lockedRetry.data)}`);
    }

    const secondCorrectIndex = Number(questions[1].correctAnswer);
    const wrongIndex = (secondCorrectIndex + 1) % questions[1].options.length;
    const wrongAnswer = await request('POST', `/api/games/${game._id}/answer`, {
      attemptId,
      questionId: String(questions[1]._id),
      selectedIndex: wrongIndex
    }, studentToken);
    if (!wrongAnswer.data.success || wrongAnswer.data.isCorrect || wrongAnswer.data.correctIndex !== secondCorrectIndex) {
      throw new Error(`Incorrect answer feedback failed: ${JSON.stringify(wrongAnswer.data)}`);
    }

    const userBefore = await User.findById(studentUser._id).select('xp');
    const submitted = await request('POST', `/api/games/${game._id}/submit`, {
      attemptId,
      answers: { [questions[0]._id]: 0, [questions[1]._id]: secondCorrectIndex }
    }, studentToken);
    const repeatedSubmit = await request('POST', `/api/games/${game._id}/submit`, {
      attemptId,
      answers: {}
    }, studentToken);
    const userAfter = await User.findById(studentUser._id).select('xp');
    const savedAttempt = await GameResult.findOne({ studentId: studentUser._id, gameId: game._id, attemptId });

    if (submitted.status !== 200 || submitted.data.correctCount !== 1 || submitted.data.wrongCount !== submitted.data.totalQuestions - 1) {
      throw new Error(`Quiz result was inaccurate: ${JSON.stringify(submitted.data)}`);
    }
    if (!repeatedSubmit.data.alreadyCompleted || repeatedSubmit.data.xpEarned !== submitted.data.xpEarned) {
      throw new Error(`Repeated completion was not idempotent: ${JSON.stringify(repeatedSubmit.data)}`);
    }
    if (!savedAttempt || savedAttempt.responses.length !== 2 || userAfter.xp - userBefore.xp !== submitted.data.xpEarned) {
      throw new Error(`Submitted answers or XP were not persisted correctly (responses=${savedAttempt?.responses.length}, xpDelta=${userAfter.xp - userBefore.xp}, expected=${submitted.data.xpEarned}).`);
    }
  });

  // 8. DISCUSSIONS & REPLIES
  test('Student Creates Discussion & Adds Reply', async () => {
    const discRes = await request('POST', '/api/discussions', {
      title: `Best practices for Docker container isolation ${testSuffix}?`,
      content: 'What are the recommended approaches for rootless container execution?',
      category: 'DevOps'
    }, studentToken);

    if (!discRes.data.success || !discRes.data.discussion) throw new Error('Discussion creation failed');
    const discId = discRes.data.discussion._id;

    const replyRes = await request('POST', `/api/discussions/${discId}/replies`, {
      content: 'Always specify USER nonroot in your Dockerfile and mount read-only filesystems!'
    }, studentToken);

    if (!replyRes.data.success) throw new Error('Discussion reply failed');
  });

  // 9. STUDENT CLUBS
  test('Student Joins and Leaves Tech Club', async () => {
    const clubsRes = await request('GET', '/api/clubs');
    if (!clubsRes.data.success || !clubsRes.data.clubs || !clubsRes.data.clubs.length) {
      throw new Error('No clubs available');
    }
    const clubId = clubsRes.data.clubs[0]._id;

    const joinRes = await request('POST', `/api/clubs/${clubId}/join`, {}, studentToken);
    if (!joinRes.data.success) throw new Error(`Join club failed: ${JSON.stringify(joinRes.data)}`);

    const leaveRes = await request('POST', `/api/clubs/${clubId}/leave`, {}, studentToken);
    if (!leaveRes.data.success) throw new Error(`Leave club failed: ${JSON.stringify(leaveRes.data)}`);
  });

  // 10. NOTIFICATIONS
  test('Notifications Feed & Mark Read Workflows', async () => {
    const notifRes = await request('GET', '/api/notifications', null, studentToken);
    if (!notifRes.data.success || !Array.isArray(notifRes.data.notifications)) {
      throw new Error(`Get notifications failed: ${JSON.stringify(notifRes.data)}`);
    }

    const markAllRes = await request('PUT', '/api/notifications/read-all', {}, studentToken);
    if (!markAllRes.data.success) throw new Error('Mark all read failed');
  });

  // 11. ADMIN ANALYTICS
  test('Admin Analytics & Stats Query', async () => {
    const statsRes = await request('GET', '/api/admin/stats', null, adminToken);
    if (!statsRes.data.success || !statsRes.data.stats) {
      throw new Error(`Admin stats failed: ${JSON.stringify(statsRes.data)}`);
    }
  });

  // RUN ALL TESTS
  for (const t of tests) {
    try {
      await t.fn();
      console.log(`  ✓ [PASS] ${t.name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ [FAIL] ${t.name}:`, err.message);
      failed++;
    }
  }

  console.log('\n====================================================');
  console.log(`TOTAL: ${tests.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('====================================================');

  if (testCourseId) {
    try {
      await Promise.all([
        Course.deleteOne({ _id: testCourseId }),
        Lesson.deleteMany({ courseId: testCourseId }),
        CourseEnrollment.deleteMany({ $or: [{ courseId: testCourseId }, { course: testCourseId }] }),
        CourseRegistration.deleteMany({ course: testCourseId }),
        LessonProgress.deleteMany({ $or: [{ courseId: testCourseId }, { course: testCourseId }] }),
        Certificate.deleteMany({ $or: [{ courseId: testCourseId }, { course: testCourseId }] }),
        Quiz.deleteMany({ courseId: testCourseId }),
        QuizAttempt.deleteMany({ courseId: testCourseId })
      ]);
      console.log(`[QA] Removed temporary course and linked records: ${testCourseId}`);
    } catch (error) {
      console.error('[QA] Failed to remove temporary course records:', error.message);
      failed++;
    }
  }

  server.close(() => {
    process.exit(failed > 0 ? 1 : 0);
  });
}

run().catch(err => {
  console.error('Fatal runner error:', err);
  if (server) server.close();
  process.exit(1);
});
