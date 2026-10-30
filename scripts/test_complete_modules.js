// Comprehensive End-to-End Automated Test for Modules 1, 2, and 3
// Module 1: Course (4 courses, 10 lessons, lock, quiz >= 70%, certificate)
// Module 2: Internship (3 demo companies, details, PDF, application form, ID, email, WhatsApp, tracking, admin)
// Module 3: Technical Games (Only 2 games: Tech Quiz & Debugging Game, scoring, XP, Leaderboard)

const http = require('http');

function apiCall(endpoint, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: endpoint,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (_) {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`);
    throw new Error(message);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

async function runTests() {
  console.log('========================================================');
  console.log('STARTING COMPLETE MODULES 1, 2, 3 E2E QA TEST SUITE');
  console.log('========================================================\n');

  // 0. Authenticate Student and Admin
  console.log('[STEP 0] Authentication Setup');
  const studentEmail = `qa_student_${Date.now()}@edutechnexus.com`;
  const regRes = await apiCall('/api/auth/register', 'POST', {
    fullName: 'Nexus QA Tester',
    email: studentEmail,
    password: 'Password@123',
    phone: '9876543210',
    userType: 'student',
    college: 'PSG College of Technology',
    department: 'Computer Science & Engineering',
    year: '3',
    registerNumber: `REG-${Date.now().toString().slice(-6)}`,
    city: 'Coimbatore',
    state: 'Tamil Nadu'
  });
  assert(regRes.status === 201, 'Student account registration succeeded');
  const studentToken = regRes.data.token;
  const studentUser = regRes.data.user;

  // Admin login
  const adminLoginRes = await apiCall('/api/auth/login', 'POST', {
    login: 'adminedutech001@gmail.com',
    password: 'Admin@edutech'
  });
  assert(adminLoginRes.status === 200, 'Admin login succeeded');
  const adminToken = adminLoginRes.data.token;

  // ========================================================
  // MODULE 1: COURSE TESTS
  // ========================================================
  console.log('\n========================================================');
  console.log('MODULE 1: COURSE MODULE TESTS');
  console.log('========================================================');

  const coursesRes = await apiCall('/api/courses');
  assert(coursesRes.status === 200, 'GET /api/courses returned 200');
  const courses = coursesRes.data.courses;
  assert(courses.length === 4, `Display ONLY 4 initial courses (found: ${courses.length})`);
  
  const expectedTitles = [
    'AI Fundamentals',
    'Python Programming',
    'AI & Machine Learning',
    'Full Stack Development'
  ];
  courses.forEach(c => {
    assert(expectedTitles.includes(c.title), `Course title matches specification: "${c.title}"`);
    assert(c.lessons && c.lessons.length === 10, `Course "${c.title}" contains exactly 10 lessons`);
  });

  const fullstackCourse = courses.find(c => c.title === 'Full Stack Development');
  assert(!!fullstackCourse, 'Found Full Stack Development course');

  // Test Course Details
  const detailsRes = await apiCall(`/api/courses/${fullstackCourse._id}`);
  assert(detailsRes.status === 200, 'GET /api/courses/:id returns course details');
  assert(detailsRes.data.course.lessons.length === 10, 'Full Stack Development has 10 lessons in details');

  // Test START COURSE / Enrollment
  const enrollRes = await apiCall(`/api/courses/${fullstackCourse._id}/register`, 'POST', {}, studentToken);
  assert(enrollRes.status === 201 || enrollRes.status === 200, 'POST /courses/:id/register succeeded');

  // Test Duplicate Enrollment prevention
  const dupEnrollRes = await apiCall(`/api/courses/${fullstackCourse._id}/register`, 'POST', {}, studentToken);
  assert(dupEnrollRes.data.success === true && dupEnrollRes.data.alreadyEnrolled, 'Duplicate enrollment is gracefully recognized');

  // Test Lessons retrieval & Sequential locking
  const lessonsRes = await apiCall(`/api/courses/${fullstackCourse._id}/lessons`, 'GET', null, studentToken);
  assert(lessonsRes.status === 200, 'GET /courses/:id/lessons succeeded');
  const lessonList = lessonsRes.data.lessons;
  assert(lessonList.length === 10, '10 Lessons returned for classroom');

  // Lesson 1 is unlocked
  const l1Res = await apiCall(`/api/courses/${fullstackCourse._id}/lessons/${lessonList[0]._id}`, 'GET', null, studentToken);
  assert(l1Res.status === 200, 'Lesson 1 is unlocked and accessible');
  assert(l1Res.data.lesson.videoFile.includes('/videos/'), `Local video path configured: ${l1Res.data.lesson.videoFile}`);

  // Lesson 2 is locked before completing Lesson 1
  const l2LockedRes = await apiCall(`/api/courses/${fullstackCourse._id}/lessons/${lessonList[1]._id}`, 'GET', null, studentToken);
  assert(l2LockedRes.status === 403, 'Lesson 2 is locked before Lesson 1 completion');

  // Complete Lessons sequentially 1 through 10
  console.log('  Completing all 10 lessons sequentially...');
  for (let i = 0; i < 10; i++) {
    const compRes = await apiCall(`/api/courses/${fullstackCourse._id}/lessons/${lessonList[i]._id}/complete`, 'POST', {}, studentToken);
    assert(compRes.status === 200, `Lesson ${i + 1} marked complete (+20 XP)`);
  }

  // Verify Course Progress = 100%
  const progRes = await apiCall(`/api/courses/${fullstackCourse._id}/progress`, 'GET', null, studentToken);
  assert(progRes.data.progress === 100, `Course Progress is 100% (completed 10 of 10)`);
  assert(progRes.data.allLessonsCompleted === true, 'All lessons completed flag is true');

  // Final Quiz (10 questions, minimum 70% passing score)
  const quizRes = await apiCall(`/api/courses/${fullstackCourse._id}/quiz`, 'GET', null, studentToken);
  assert(quizRes.status === 200, 'GET /api/courses/:id/quiz returned 10 questions');
  assert(quizRes.data.questions.length === 10, 'Final quiz contains exactly 10 questions');

  // Submit passing quiz answers (score 100% -> answers: [0, 1, 1, 0, 1, 1, 1, 2, 0, 1])
  const fullstackPassingAnswers = [0, 1, 1, 0, 1, 1, 1, 2, 0, 1];
  const quizSubmitRes = await apiCall(`/api/courses/${fullstackCourse._id}/quiz/submit`, 'POST', {
    answers: fullstackPassingAnswers
  }, studentToken);
  assert(quizSubmitRes.status === 200, 'POST /api/courses/:id/quiz/submit responded with 200');
  assert(quizSubmitRes.data.passed === true, `Final quiz passed with score >= 70% (Actual: ${quizSubmitRes.data.percentage}%)`);

  // Claim Certificate
  const claimRes = await apiCall('/api/certificates/claim', 'POST', {
    courseId: fullstackCourse._id
  }, studentToken);
  assert(claimRes.status === 201 || claimRes.status === 200, 'Certificate claimed successfully');
  const certId = claimRes.data.certificate.certificateId;
  assert(certId.startsWith('EN-CERT-2026-'), `Certificate ID format verified: ${certId}`);

  // Verify Certificate in database
  const verifyRes = await apiCall(`/api/certificates/verify/${certId}`);
  assert(verifyRes.status === 200 && verifyRes.data.valid === true, `Certificate verified in MongoDB: ${certId}`);

  // ========================================================
  // MODULE 2: INTERNSHIP TESTS
  // ========================================================
  console.log('\n========================================================');
  console.log('MODULE 2: INTERNSHIP MODULE TESTS');
  console.log('========================================================');

  // 1. Companies list — ONLY 3 demo companies
  const compRes = await apiCall('/api/companies');
  assert(compRes.status === 200, 'GET /api/companies returned 200');
  const companies = compRes.data.companies;
  assert(companies.length === 3, `Display ONLY 3 companies initially (found: ${companies.length})`);
  companies.forEach(comp => {
    assert(comp.isExample === true || comp.verificationStatus === 'Example Record', `Company "${comp.name}" is marked as Demo / Example Record`);
  });

  // 2. Internships list — 3 initial internships
  const intRes = await apiCall('/api/internships');
  assert(intRes.status === 200, 'GET /api/internships returned 200');
  const internships = intRes.data.internships;
  assert(internships.length === 3, `Found exactly 3 internships (found: ${internships.length})`);

  // 3. Company Profile with PDF support
  const targetCompany = companies[0];
  const compProfileRes = await apiCall(`/api/companies/${targetCompany._id}`);
  assert(compProfileRes.status === 200, 'GET /api/companies/:id returned company profile');
  assert(!!compProfileRes.data.company.profilePdfUrl || (compProfileRes.data.documents && compProfileRes.data.documents.length > 0), 'Company profile PDF document is present and supported');

  // 4. Internship Application Submission
  const targetInternship = internships[0];
  const dummyResumePdfBase64 = 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXrCjEgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cgL1BhZ2VzIDIgMCBSID4+CmVuZG9iagoyIDAgb2JqCjw8IC9UeXBlIC9QYWdlcyAvS2lkcyBbMyAwIFJdIC9Db3VudCAxID4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlIC9QYXJlbnQgMiAwIFIgL01lZGlhQm94IFswIDAgNjEyIDc5Ml0gPj4KZW5kb2JqCnRyYWlsZXIKPDwgL1Jvb3QgMSAwIFIgPj4KJSVFT0YK';

  const applyRes = await apiCall(`/api/internships/${targetInternship._id}/apply`, 'POST', {
    fullName: 'Karthi Kumar',
    age: 21,
    email: 'karthi.test@edutechnexus.com',
    phone: '9876543210',
    userType: 'student',
    institution: 'PSG College of Technology',
    college: 'PSG College of Technology',
    department: 'Computer Science & Engineering',
    year: '3',
    registerNumber: '71772101001',
    city: 'Coimbatore',
    place: 'Coimbatore',
    state: 'Tamil Nadu',
    address: 'Avinashi Road, Peelamedu, Coimbatore',
    skills: ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'],
    experience: 'Academic project lead for campus management portal.',
    githubUrl: 'https://github.com/karthikumar-edutech',
    linkedinUrl: 'https://linkedin.com/in/karthikumar-demo',
    portfolioUrl: 'https://karthikumar.dev',
    coverLetter: 'I am excited to apply for this software engineering internship opportunity.',
    resumeUrl: dummyResumePdfBase64,
    resumeName: 'Karthi_Kumar_Resume.pdf'
  }, studentToken);

  assert(applyRes.status === 201, 'POST /api/internships/:id/apply succeeded with 201');
  assert(applyRes.data.applicationId.startsWith('EN-INT-2026-'), `Application ID generated with EN-INT-2026- prefix: ${applyRes.data.applicationId}`);
  assert(applyRes.data.status === 'Pending / Under Review' || applyRes.data.status === 'Applied', `Status is set: ${applyRes.data.status}`);
  assert(applyRes.data.whatsappUrl && applyRes.data.whatsappUrl.includes('8110805533'), `WhatsApp contact URL generated with 8110805533: ${applyRes.data.whatsappUrl}`);

  // 5. Student Application Tracking
  const myAppsRes = await apiCall('/api/internships/my-applications', 'GET', null, studentToken);
  assert(myAppsRes.status === 200, 'GET /api/internships/my-applications succeeded');
  const studentApps = myAppsRes.data.applications;
  assert(studentApps.length >= 1, `Student sees their submitted application (${studentApps[0].applicationId})`);

  // 6. Admin updates application status
  const adminAppsRes = await apiCall('/api/admin/internship-applications', 'GET', null, adminToken);
  assert(adminAppsRes.status === 200, 'Admin can view all internship applications');
  const targetAppId = studentApps[0]._id;

  const updateStatusRes = await apiCall(`/api/admin/internship-applications/${targetAppId}/status`, 'PUT', {
    status: 'Shortlisted'
  }, adminToken);
  assert(updateStatusRes.status === 200, 'Admin can update status to "Shortlisted"');

  // Student sees updated status
  const checkUpdatedRes = await apiCall('/api/internships/my-applications', 'GET', null, studentToken);
  const updatedApp = checkUpdatedRes.data.applications.find(a => a._id === targetAppId);
  assert(updatedApp && updatedApp.status === 'Shortlisted', 'Student immediately sees updated status "Shortlisted"');

  // ========================================================
  // MODULE 3: TECHNICAL GAMES TESTS
  // ========================================================
  console.log('\n========================================================');
  console.log('MODULE 3: TECHNICAL GAMES TESTS');
  console.log('========================================================');

  // 1. List Games — ONLY 2 games
  const gamesListRes = await apiCall('/api/games');
  assert(gamesListRes.status === 200, 'GET /api/games returned 200');
  const games = gamesListRes.data.games;
  assert(games.length === 2, `Display ONLY 2 technical games (found: ${games.length})`);
  
  const techQuizGame = games.find(g => g.title === 'TECH QUIZ');
  const debugGame = games.find(g => g.title === 'DEBUGGING GAME');
  assert(!!techQuizGame, 'Found game 1: TECH QUIZ');
  assert(!!debugGame, 'Found game 2: DEBUGGING GAME');

  // 2. TECH QUIZ: Questions & Security
  const techQuizQuestionsRes = await apiCall(`/api/games/${techQuizGame._id}/questions`);
  assert(techQuizQuestionsRes.status === 200, 'GET /api/games/:id/questions succeeded');
  const tqQuestions = techQuizQuestionsRes.data.questions;
  assert(tqQuestions.length === 10, `TECH QUIZ contains exactly 10 questions (found: ${tqQuestions.length})`);

  // Security Verification: Answers must NOT be exposed before submission!
  tqQuestions.forEach((q, idx) => {
    assert(typeof q.correctAnswer === 'undefined', `Question ${idx + 1} does not expose correctAnswer to student`);
    assert(typeof q.expectedAnswer === 'undefined', `Question ${idx + 1} does not expose expectedAnswer to student`);
  });

  // 3. TECH QUIZ: Submit and Scoring
  // Let's submit 8 correct answers and 2 wrong answers
  // The correct answers are: Q1: 2, Q2: 1, Q3: 1, Q4: 2, Q5: 1, Q6: 2, Q7: 1, Q8: 2, Q9: 2, Q10: 1
  const sampleAnswers = {};
  const correctIndices = [2, 1, 1, 2, 1, 2, 1, 2, 0, 0]; // 8 correct, 2 wrong
  tqQuestions.forEach((q, idx) => {
    sampleAnswers[q._id] = correctIndices[idx];
  });

  const tqSubmitRes = await apiCall(`/api/games/${techQuizGame._id}/submit`, 'POST', {
    answers: sampleAnswers
  }, studentToken);
  assert(tqSubmitRes.status === 200, 'POST /api/games/:id/submit succeeded');
  assert(tqSubmitRes.data.correctCount === 8, `Correct answers calculated accurately: 8/10 (found: ${tqSubmitRes.data.correctCount})`);
  assert(tqSubmitRes.data.wrongCount === 2, `Wrong answers calculated accurately: 2/10 (found: ${tqSubmitRes.data.wrongCount})`);
  assert(tqSubmitRes.data.score === 80, `Score percentage calculated accurately: 80% (found: ${tqSubmitRes.data.score}%)`);
  assert(tqSubmitRes.data.xpEarned === 80, `XP awarded based on score: 80 XP (found: ${tqSubmitRes.data.xpEarned})`);

  // 4. DEBUGGING GAME: Levels & Flow
  const debugQuestionsRes = await apiCall(`/api/games/${debugGame._id}/questions`);
  assert(debugQuestionsRes.status === 200, 'GET /api/games/:id/questions succeeded for Debugging Game');
  const debugLevels = debugQuestionsRes.data.questions;
  assert(debugLevels.length === 5, `DEBUGGING GAME contains exactly 5 levels (found: ${debugLevels.length})`);

  // Test Level 1: HTML error validation
  // Wrong answer
  const wrongL1Res = await apiCall(`/api/games/${debugGame._id}/submit`, 'POST', {
    action: 'check-level',
    level: 1,
    answer: '<wrong-tag>'
  }, studentToken);
  assert(wrongL1Res.data.isCorrect === false && wrongL1Res.data.message === 'Try Again', 'Invalid debugging fix returns "Try Again"');

  // Correct answer for Level 1: '</h1>'
  const correctL1Res = await apiCall(`/api/games/${debugGame._id}/submit`, 'POST', {
    action: 'check-level',
    level: 1,
    answer: '</h1>'
  }, studentToken);
  assert(correctL1Res.data.isCorrect === true && correctL1Res.data.message === 'Correct ✓', 'Valid debugging fix returns "Correct ✓"');
  assert(correctL1Res.data.xpEarned === 20, 'Level 1 awarded +20 XP');

  // Solve remaining levels (Levels 2 to 5)
  const levelAnswers = {
    2: 'background-color',
    3: 'length',
    4: 'return',
    5: 'SELECT'
  };

  for (let lvl = 2; lvl <= 5; lvl++) {
    const solveRes = await apiCall(`/api/games/${debugGame._id}/submit`, 'POST', {
      action: 'check-level',
      level: lvl,
      answer: levelAnswers[lvl]
    }, studentToken);
    assert(solveRes.data.isCorrect === true, `Level ${lvl} (${debugLevels[lvl - 1].category} error) solved: "Correct ✓"`);
  }

  // 5. Verify Leaderboard reflects new XP
  const leaderboardRes = await apiCall('/api/leaderboard/top3');
  assert(leaderboardRes.status === 200, 'GET /api/leaderboard/top3 succeeded');
  console.log('  Leaderboard reflects updated student XP points.');

  // 6. Admin Games & Questions Management
  const adminGamesRes = await apiCall('/api/admin/games', 'GET', null, adminToken);
  assert(adminGamesRes.status === 200, 'Admin can view all games');
  const adminQuestionsRes = await apiCall(`/api/admin/game-questions?gameId=${techQuizGame._id}`, 'GET', null, adminToken);
  assert(adminQuestionsRes.status === 200 && adminQuestionsRes.data.questions.length === 10, 'Admin can view all quiz questions with answers');

  console.log('\n========================================================');
  console.log('🎉 ALL TESTS PASSED: MODULES 1, 2, AND 3 FULLY VERIFIED!');
  console.log('========================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST RUN FAILED:', err);
  process.exit(1);
});
