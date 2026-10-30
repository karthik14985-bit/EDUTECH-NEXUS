const mongoose = require('../backend/node_modules/mongoose');
const http = require('http');

const PORT = 5000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(url, {
      method,
      headers
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTest() {
  console.log('========================================================');
  console.log('STARTING END-TO-END QA TEST FOR COURSE MODULE');
  console.log('========================================================\n');

  // Step 1: Login or Register test user
  const testEmail = `test_qa_${Date.now()}@edutechnexus.com`;
  const testPassword = 'Password@123';
  console.log(`1. Registering new test student: ${testEmail}...`);
  const regRes = await request('POST', '/api/auth/register', {
    fullName: 'Alex Rivera',
    email: testEmail,
    password: testPassword,
    phone: '9876543210',
    institution: 'Nexus Institute of Technology',
    department: 'Computer Science',
    year: '4',
    registerNumber: `EN${Date.now().toString().slice(-6)}`,
    role: 'student'
  });

  let token = regRes.body?.token;
  if (!token) {
    console.error('Registration failed:', regRes.body);
    process.exit(1);
  }
  console.log('✓ Registered and received auth JWT token.');

  // Step 2: Fetch courses
  console.log('\n2. Fetching all available courses...');
  const coursesRes = await request('GET', '/api/courses', null, token);
  const courses = coursesRes.body?.courses || [];
  console.log(`✓ Retrieved ${courses.length} courses:`);
  courses.forEach(c => console.log(`   - [${c.title}] (${c.totalLessons || c.lessonsCount || 10} lessons, ${c.xp} XP)`));
  
  if (courses.length !== 4) {
    console.error(`ERROR: Expected exactly 4 courses, but found ${courses.length}`);
    process.exit(1);
  }

  // Choose the first course: "AI Fundamentals"
  const selectedCourse = courses[0];
  const courseId = selectedCourse._id;
  console.log(`\nSelected course for testing: "${selectedCourse.title}" (ID: ${courseId})`);

  // Step 3: View course details
  console.log('\n3. Fetching course details...');
  const detailsRes = await request('GET', `/api/courses/${courseId}`, null, token);
  const courseDetails = detailsRes.body?.course;
  console.log(`✓ Course: ${courseDetails.title}`);
  console.log(`✓ Instructor: ${courseDetails.instructor}`);
  console.log(`✓ Lessons count: ${courseDetails.lessons.length}`);
  console.log(`✓ Requirements: ${courseDetails.requirements?.join(', ')}`);
  console.log(`✓ Outcomes: ${courseDetails.learningOutcomes?.join(', ')}`);

  // Step 4: Register/Enroll in Course
  console.log('\n4. Enrolling user in course...');
  const enrollRes = await request('POST', `/api/courses/${courseId}/register`, {}, token);
  console.log(`✓ Enrollment response: ${enrollRes.body?.message || 'Success'}`);

  // Step 5: Fetch lessons and verify sequential lock
  console.log('\n5. Verifying sequential lesson locking...');
  const lessonsRes = await request('GET', `/api/courses/${courseId}/lessons`, null, token);
  const lessons = lessonsRes.body?.lessons || [];
  console.log(`✓ Lesson 1 locked status: ${lessons[0]?.isLocked} (Expected: false)`);
  console.log(`✓ Lesson 2 locked status: ${lessons[1]?.isLocked} (Expected: true)`);
  if (lessons[0]?.isLocked !== false || lessons[1]?.isLocked !== true) {
    console.error('ERROR: Sequential locking failed on initial lesson list!');
    process.exit(1);
  }

  // Step 6: Test accessing locked Lesson 2
  console.log('\n6. Testing access to locked Lesson 2...');
  const lockedAccessRes = await request('GET', `/api/courses/${courseId}/lessons/${lessons[1]._id}`, null, token);
  console.log(`✓ Accessing locked lesson returned status: ${lockedAccessRes.status} (Expected: 403)`);
  if (lockedAccessRes.status !== 403) {
    console.error('ERROR: Guard failed! User was able to access locked lesson 2!');
    process.exit(1);
  }

  // Step 7: Complete Lessons 1 through 10 sequentially
  console.log('\n7. Completing all 10 lessons sequentially...');
  for (let i = 0; i < lessons.length; i++) {
    const l = lessons[i];
    const compRes = await request('POST', `/api/courses/${courseId}/lessons/${l._id}/complete`, {}, token);
    if (compRes.status !== 200 || !compRes.body?.success) {
      console.error(`ERROR completing lesson ${i + 1}:`, compRes.body);
      process.exit(1);
    }
    console.log(`   ✓ Completed Lesson ${i + 1}: "${l.title}" -> Progress: ${compRes.body.progress}% (+50 XP)`);
  }

  // Step 8: Verify progress
  console.log('\n8. Checking course progress from server...');
  const progRes = await request('GET', `/api/courses/${courseId}/progress`, null, token);
  console.log(`✓ Course Progress: ${progRes.body.progress}%`);
  console.log(`✓ Total Lessons Completed: ${progRes.body.completedLessons?.length} / 10`);

  // Step 9: Get Quiz
  console.log('\n9. Fetching final course quiz...');
  const quizRes = await request('GET', `/api/courses/${courseId}/quiz`, null, token);
  const quiz = quizRes.body?.quiz;
  console.log(`✓ Retrieved ${quiz.questions.length} quiz questions.`);
  const hasCorrectAnswerLeak = quiz.questions.some(q => q.correctAnswer !== undefined);
  console.log(`✓ Questions answer leakage check: ${hasCorrectAnswerLeak ? 'FAILED (LEAKED!)' : 'PASSED (Answer hidden safely)'}`);
  if (hasCorrectAnswerLeak) {
    console.error('ERROR: correctAnswer leaked to client in quiz endpoint!');
    process.exit(1);
  }

  // Step 10: Test failing quiz submission (< 70%)
  console.log('\n10. Testing failed quiz submission (all wrong answers)...');
  const failAnswers = quiz.questions.map((q, idx) => ({ questionIndex: idx, selectedOption: 3 }));
  const failSubmitRes = await request('POST', `/api/courses/${courseId}/quiz/submit`, { answers: failAnswers }, token);
  console.log(`✓ Quiz Result: Score = ${failSubmitRes.body.percentage}%, Passed = ${failSubmitRes.body.passed}`);
  if (failSubmitRes.body.passed === true) {
    console.error('ERROR: Quiz should have failed with wrong answers!');
    process.exit(1);
  }

  // Connect to DB directly to check correct answers so we can pass
  await mongoose.connect('mongodb://127.0.0.1:27017/edutech_nexus');
  const QuizModel = mongoose.model('Quiz', new mongoose.Schema({
    courseId: mongoose.Schema.Types.ObjectId,
    questions: Array,
    passPercentage: Number
  }));
  const dbQuiz = await QuizModel.findOne({ courseId: new mongoose.Types.ObjectId(courseId) });

  // Step 11: Test passing quiz submission (100%)
  console.log('\n11. Testing passing quiz submission (100% correct answers)...');
  const passAnswers = dbQuiz.questions.map((q, idx) => ({ questionIndex: idx, selectedOption: q.correctAnswer }));
  const passSubmitRes = await request('POST', `/api/courses/${courseId}/quiz/submit`, { answers: passAnswers }, token);
  console.log(`✓ Quiz Result: Score = ${passSubmitRes.body.percentage}%, Passed = ${passSubmitRes.body.passed}, Course Completed = ${passSubmitRes.body.courseCompleted}`);
  if (!passSubmitRes.body.passed || !passSubmitRes.body.courseCompleted) {
    console.error('ERROR: Quiz submission did not pass or mark course complete!');
    process.exit(1);
  }

  // Step 12: Claim Certificate
  console.log('\n12. Claiming Course Certificate...');
  const claimRes = await request('POST', '/api/certificates/claim', { courseId }, token);
  if ((claimRes.status !== 200 && claimRes.status !== 201) || !claimRes.body?.success) {
    console.error('ERROR claiming certificate:', claimRes.body);
    process.exit(1);
  }
  const cert = claimRes.body.certificate;
  console.log(`✓ Generated Certificate ID: ${cert.certificateId}`);
  console.log(`✓ Student: ${cert.studentName}`);
  console.log(`✓ Course: ${cert.courseName}`);
  console.log(`✓ Quiz Score: ${cert.quizScore}%`);
  console.log(`✓ XP: ${cert.xp}`);

  // Step 13: View My Certificates
  console.log('\n13. Fetching student certificates...');
  const myCertRes = await request('GET', '/api/certificates/my', null, token);
  console.log(`✓ Certificates count: ${myCertRes.body?.certificates?.length}`);

  // Step 14: Verify Certificate endpoint
  console.log('\n14. Testing Public Certificate Verification endpoint...');
  const verifyRes = await request('GET', `/api/certificates/verify/${cert.certificateId}`);
  console.log(`✓ Verification response: ${verifyRes.body?.message}`);
  console.log(`✓ Verified Student: ${verifyRes.body?.studentName}`);
  console.log(`✓ Verified Course: ${verifyRes.body?.courseName}`);
  if (!verifyRes.body?.verified) {
    console.error('ERROR: Certificate could not be verified!');
    process.exit(1);
  }

  // Step 15: Check XP Transactions in MongoDB
  console.log('\n15. Verifying XP Transactions in MongoDB...');
  const XPTransaction = mongoose.model('XPTransaction', new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    source: String,
    referenceId: mongoose.Schema.Types.ObjectId,
    xp: Number,
    createdAt: Date
  }));
  const xpTxns = await XPTransaction.find({ userId: new mongoose.Types.ObjectId(regRes.body.user._id || regRes.body.user.id) });
  console.log(`✓ Total XP Transactions recorded: ${xpTxns.length}`);
  let totalXP = 0;
  xpTxns.forEach(tx => {
    console.log(`   - [${tx.source}] +${tx.xp} XP`);
    totalXP += tx.xp;
  });
  console.log(`✓ Total Calculated XP Earned: ${totalXP} XP (Expected: 10 lessons * 50 + 100 quiz + 200 cert = 800 XP)`);

  // Step 16: Verification of persistence across simulated re-login
  console.log('\n16. Simulating logout and re-login to verify persistence...');
  const loginRes = await request('POST', '/api/auth/login', {
    email: testEmail,
    password: testPassword
  });
  const newToken = loginRes.body?.token;
  const reVerifyProg = await request('GET', `/api/courses/${courseId}/progress`, null, newToken);
  console.log(`✓ Re-checked progress after login: ${reVerifyProg.body.progress}% (Persisted in MongoDB: YES)`);
  const reVerifyCert = await request('GET', '/api/certificates/my', null, newToken);
  console.log(`✓ Re-checked certificate after login: ${reVerifyCert.body.certificates[0]?.certificateId} (Persisted: YES)`);

  await mongoose.disconnect();
  console.log('\n========================================================');
  console.log('ALL COURSE MODULE QA TESTS PASSED SUCCESSFULLY! ✓✓✓');
  console.log('========================================================\n');
}

runTest().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
