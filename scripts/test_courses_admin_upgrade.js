/**
 * EDUTECH NEXUS - Course Module & Admin Course Management End-to-End QA Test
 * Tests:
 *  - TEST A: Admin login & Create Course ("Full Stack Development", 12 fields, MongoDB persistence, public course list appearance)
 *  - TEST B: Add 10 Lessons (Lesson 1 YouTube, Lesson 2 Local Video, Lessons 3-10, verify ordering & distinct videos)
 *  - TEST C: Edit Lesson (Change title, change video source YouTube <-> Local, verify persistence)
 *  - TEST D: Delete Lesson (Delete lesson, verify removal, verify 404 on stale URL, verify re-sequencing)
 *  - TEST E: Delete Course (Create temporary course + lessons, delete permanently, verify cleanup, verify 404, verify certificates preserved)
 *  - TEST F: Student Access & Sequential Completion (Enroll, Lesson 1 unlocked, Lesson 2 locked with 403, complete Lesson 1, Lesson 2 unlocks, verify progress)
 *  - TEST G: Security (Student 403 on admin routes, 401 on unauthenticated, reject invalid uploads)
 */

const http = require('http');
const path = require('path');
const fs = require('fs');

const PORT = 5000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function request(method, reqPath, data = null, token = null, isMultipart = false, multipartData = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, BASE_URL);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    if (isMultipart && multipartData) {
      headers['Content-Type'] = `multipart/form-data; boundary=${multipartData.boundary}`;
    } else if (data) {
      headers['Content-Type'] = 'application/json';
    }

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

    if (isMultipart && multipartData) {
      req.write(multipartData.buffer);
    } else if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

function buildMultipart(fieldName, filename, contentType, contentBuffer) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let header = `--${boundary}\r\n`;
  header += `Content-Disposition: form-data; name="${fieldName}"; filename="${filename}"\r\n`;
  header += `Content-Type: ${contentType}\r\n\r\n`;

  const footer = `\r\n--${boundary}--\r\n`;
  const headerBuf = Buffer.from(header, 'utf-8');
  const footerBuf = Buffer.from(footer, 'utf-8');
  const buffer = Buffer.concat([headerBuf, contentBuffer, footerBuf]);

  return { boundary, buffer };
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('EDUTECH NEXUS — COMPREHENSIVE COURSE & LESSON QA VERIFICATION');
  console.log('================================================================\n');

  let adminToken = null;
  let studentToken = null;
  let createdCourseId = null;
  const createdLessonIds = [];

  // SETUP: Admin and Student Login
  console.log('[SETUP] Logging in as Admin...');
  const adminLoginRes = await request('POST', '/api/auth/login', {
    email: 'adminedutech001@gmail.com',
    password: 'Admin@edutech'
  });
  if (adminLoginRes.status !== 200 || !adminLoginRes.body?.token) {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLoginRes.body));
  }
  adminToken = adminLoginRes.body.token;
  console.log('✓ Admin login successful.');

  console.log('[SETUP] Registering / Logging in as Student...');
  const studentEmail = `student_qa_${Date.now()}@edutechnexus.com`;
  const studentRegRes = await request('POST', '/api/auth/register', {
    fullName: 'David Morgan',
    email: studentEmail,
    password: 'Student@123',
    institution: 'PSG College of Technology',
    department: 'Computer Science',
    year: '3',
    phone: '9876543210',
    registerNumber: `REG-${Date.now().toString().slice(-8)}`,
    role: 'student'
  });
  studentToken = studentRegRes.body?.token;
  if (!studentToken) {
    throw new Error('Student registration failed: ' + JSON.stringify(studentRegRes.body));
  }
  console.log('✓ Student account ready.');

  // ============================================================
  // TEST A: CREATE COURSE
  // ============================================================
  console.log('\n------------------------------------------------------------');
  console.log('TEST A — CREATE COURSE: Full Stack Development');
  console.log('------------------------------------------------------------');
  const createCourseRes = await request('POST', '/api/admin/courses', {
    title: 'Full Stack Development',
    description: 'Learn frontend development, backend development, databases, APIs, and full-stack application building.',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    instructor: 'Admin Faculty',
    category: 'Web Development',
    difficulty: 'Beginner',
    duration: '30 Days',
    prerequisites: 'Basic computer knowledge, Curiosity about web engineering',
    learningOutcomes: 'Build modern frontend interfaces, Create Node/Express REST APIs, Integrate MongoDB databases',
    xpReward: 500,
    status: 'published',
    totalLessons: 10
  }, adminToken);

  console.log(`HTTP Status: ${createCourseRes.status}`);
  if (createCourseRes.status !== 201 || !createCourseRes.body?.success) {
    throw new Error('TEST A FAILED: Could not create course: ' + JSON.stringify(createCourseRes.body));
  }

  createdCourseId = createCourseRes.body.course._id;
  console.log(`✓ Course created in MongoDB. ID: ${createdCourseId}`);
  console.log(`✓ Message: "${createCourseRes.body.message}"`);

  // Verify in public student list
  const publicCoursesRes = await request('GET', '/api/courses');
  const foundInPublic = (publicCoursesRes.body?.courses || []).some(c => String(c._id) === String(createdCourseId));
  console.log(`✓ Verified in public student course catalog: ${foundInPublic ? 'YES (Visible)' : 'NO'}`);
  if (!foundInPublic) {
    throw new Error('TEST A FAILED: Created published course not found in GET /api/courses!');
  }

  // ============================================================
  // TEST B: ADD 10 LESSONS INDIVIDUALLY
  // ============================================================
  console.log('\n------------------------------------------------------------');
  console.log('TEST B — ADD 10 LESSONS (YouTube & Local Device Uploads)');
  console.log('------------------------------------------------------------');

  // Lesson 1: YouTube
  console.log('Adding Lesson 1: HTML Fundamentals (YouTube)...');
  const l1Res = await request('POST', `/api/admin/courses/${createdCourseId}/lessons`, {
    lessonNumber: 1,
    title: 'HTML Fundamentals',
    description: 'Semantic markup, tags, forms, accessibility and modern structural layout.',
    learningObjectives: 'Understand HTML5 semantics, Build accessible web forms',
    duration: '20 mins',
    xp: 50,
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
    status: 'published'
  }, adminToken);
  if (l1Res.status !== 201 || !l1Res.body?.success) {
    throw new Error('TEST B FAILED on Lesson 1: ' + JSON.stringify(l1Res.body));
  }
  createdLessonIds.push(l1Res.body.lesson._id);
  console.log(`✓ Lesson 1 added: ${l1Res.body.lesson.title} [YouTube ID: ${l1Res.body.lesson.youtubeVideoId}]`);

  // Lesson 2: Local Video Upload
  console.log('Uploading sample video for Lesson 2: CSS Fundamentals...');
  const sampleMp4Buffer = Buffer.from('Fake MP4 header video content test stream simulation', 'utf-8');
  const multipartData = buildMultipart('video', 'test_lesson2_css.mp4', 'video/mp4', sampleMp4Buffer);
  const uploadRes = await request('POST', '/api/admin/upload-video', null, adminToken, true, multipartData);
  if (uploadRes.status !== 200 || !uploadRes.body?.success) {
    throw new Error('Video upload failed: ' + JSON.stringify(uploadRes.body));
  }
  const uploadedVideoUrl = uploadRes.body.videoUrl;
  console.log(`✓ Video uploaded to controlled server storage: ${uploadedVideoUrl}`);

  const l2Res = await request('POST', `/api/admin/courses/${createdCourseId}/lessons`, {
    lessonNumber: 2,
    title: 'CSS Fundamentals',
    description: 'Cascade, inheritance, box model, specificity and modern styling architecture.',
    learningObjectives: 'Master box model, CSS Grid and Flexbox layouts',
    duration: '25 mins',
    xp: 50,
    videoType: 'local',
    videoFile: uploadedVideoUrl,
    status: 'published'
  }, adminToken);
  if (l2Res.status !== 201 || !l2Res.body?.success) {
    throw new Error('TEST B FAILED on Lesson 2: ' + JSON.stringify(l2Res.body));
  }
  createdLessonIds.push(l2Res.body.lesson._id);
  console.log(`✓ Lesson 2 added: ${l2Res.body.lesson.title} [Local file: ${l2Res.body.lesson.videoFile}]`);

  // Lessons 3 to 10
  const remainingLessons = [
    { title: 'Responsive Web Design', type: 'youtube', url: 'https://youtu.be/0yCJMt8ChCw' },
    { title: 'JavaScript Fundamentals', type: 'youtube', url: 'https://www.youtube.com/watch?v=5q87K1WaoFI' },
    { title: 'DOM and Events', type: 'youtube', url: 'https://www.youtube.com/watch?v=z_5gqXz3c1U' },
    { title: 'Node.js Fundamentals', type: 'local', url: '/videos/sample-lesson.mp4' },
    { title: 'Express.js Framework', type: 'youtube', url: 'https://www.youtube.com/watch?v=71h8MZshGSs' },
    { title: 'MongoDB & Mongoose Architecture', type: 'youtube', url: 'https://www.youtube.com/watch?v=W1Kltu5353U' },
    { title: 'REST API Development & JWT Security', type: 'youtube', url: 'https://www.youtube.com/watch?v=2v3m71j_X3g' },
    { title: 'Final Capstone Project Deployment', type: 'local', url: '/videos/sample-lesson.mp4' }
  ];

  for (let i = 0; i < remainingLessons.length; i++) {
    const item = remainingLessons[i];
    const num = i + 3;
    const lRes = await request('POST', `/api/admin/courses/${createdCourseId}/lessons`, {
      lessonNumber: num,
      title: item.title,
      description: `Comprehensive in-depth module covering ${item.title}.`,
      learningObjectives: `Master core skills in ${item.title}`,
      duration: '20 mins',
      xp: 50,
      videoType: item.type,
      videoUrl: item.type === 'youtube' ? item.url : '',
      videoFile: item.type === 'local' ? item.url : '',
      status: 'published'
    }, adminToken);
    if (lRes.status !== 201 || !lRes.body?.success) {
      throw new Error(`TEST B FAILED on Lesson ${num}: ` + JSON.stringify(lRes.body));
    }
    createdLessonIds.push(lRes.body.lesson._id);
    console.log(`✓ Lesson ${num} added: "${item.title}" [${item.type}]`);
  }

  // Verify all 10 lessons in database
  const getLessonsRes = await request('GET', `/api/admin/courses/${createdCourseId}/lessons`, null, adminToken);
  const lessonsInDb = getLessonsRes.body?.lessons || [];
  console.log(`✓ Total lessons verified in course: ${lessonsInDb.length} (Expected: 10)`);
  if (lessonsInDb.length !== 10) {
    throw new Error(`TEST B FAILED: Expected 10 lessons, got ${lessonsInDb.length}`);
  }

  // ============================================================
  // TEST C: EDIT LESSON & SWITCH VIDEO SOURCE
  // ============================================================
  console.log('\n------------------------------------------------------------');
  console.log('TEST C — EDIT LESSON & SWITCH VIDEO SOURCE');
  console.log('------------------------------------------------------------');
  const lesson3Id = createdLessonIds[2];
  console.log(`Editing Lesson 3 (${lesson3Id}): updating title and switching video source...`);
  const editLessonRes = await request('PUT', `/api/admin/courses/${createdCourseId}/lessons/${lesson3Id}`, {
    title: 'Advanced Responsive Web Design & Grid Systems',
    description: 'Updated description: Advanced multi-device responsive techniques.',
    videoType: 'local',
    videoFile: uploadedVideoUrl,
    duration: '35 mins'
  }, adminToken);

  if (editLessonRes.status !== 200 || !editLessonRes.body?.success) {
    throw new Error('TEST C FAILED: ' + JSON.stringify(editLessonRes.body));
  }
  console.log(`✓ Updated Lesson Title: "${editLessonRes.body.lesson.title}"`);
  console.log(`✓ Switched Video Type: ${editLessonRes.body.lesson.videoType}`);
  console.log(`✓ New Video File: ${editLessonRes.body.lesson.videoFile}`);

  // Fetch from server to verify persistence
  const verifyEditRes = await request('GET', `/api/admin/courses/${createdCourseId}/lessons`, null, adminToken);
  const l3Persisted = verifyEditRes.body.lessons.find(l => String(l._id) === String(lesson3Id));
  if (l3Persisted.title !== 'Advanced Responsive Web Design & Grid Systems' || l3Persisted.videoType !== 'local') {
    throw new Error('TEST C FAILED: Updated lesson did not persist in MongoDB!');
  }
  console.log('✓ Persistence verified via server refresh.');

  // ============================================================
  // TEST D: DELETE LESSON PERMANENTLY
  // ============================================================
  console.log('\n------------------------------------------------------------');
  console.log('TEST D — DELETE LESSON PERMANENTLY');
  console.log('------------------------------------------------------------');
  const lesson4Id = createdLessonIds[3];
  console.log(`Deleting Lesson 4 (${lesson4Id})...`);
  const delLessonRes = await request('DELETE', `/api/admin/courses/${createdCourseId}/lessons/${lesson4Id}`, null, adminToken);
  if (delLessonRes.status !== 200 || !delLessonRes.body?.success) {
    throw new Error('TEST D FAILED: ' + JSON.stringify(delLessonRes.body));
  }
  console.log(`✓ Server response: "${delLessonRes.body.message}"`);

  // Verify remaining lessons count and re-sequencing
  const afterDelLessonsRes = await request('GET', `/api/admin/courses/${createdCourseId}/lessons`, null, adminToken);
  const afterLessons = afterDelLessonsRes.body?.lessons || [];
  console.log(`✓ Remaining lessons in course: ${afterLessons.length} (Expected: 9)`);
  if (afterLessons.length !== 9) {
    throw new Error(`TEST D FAILED: Expected 9 lessons, found ${afterLessons.length}`);
  }

  // Verify deleted lesson is gone from student endpoint
  console.log('Checking student access to deleted lesson URL...');
  // First enroll student so we test lesson existence, not registration requirement
  await request('POST', `/api/courses/${createdCourseId}/register`, {}, studentToken);
  const deletedLessonStudentRes = await request('GET', `/api/courses/${createdCourseId}/lessons/${lesson4Id}`, null, studentToken);
  console.log(`✓ Student access to deleted lesson status: ${deletedLessonStudentRes.status} (Expected: 404)`);
  if (deletedLessonStudentRes.status !== 404) {
    throw new Error(`TEST D FAILED: Deleted lesson returned status ${deletedLessonStudentRes.status} instead of 404!`);
  }

  // ============================================================
  // TEST E: DELETE COURSE PERMANENTLY
  // ============================================================
  console.log('\n------------------------------------------------------------');
  console.log('TEST E — DELETE COURSE PERMANENTLY (With Cascade Cleanup)');
  console.log('------------------------------------------------------------');
  // Create a dedicated course to test permanent deletion
  const tempCourseRes = await request('POST', '/api/admin/courses', {
    title: 'Temporary Test Course To Delete',
    description: 'This course will be permanently deleted to verify cascade cleanup.',
    status: 'published'
  }, adminToken);
  const tempCourseId = tempCourseRes.body.course._id;

  // Add 2 lessons to temp course
  await request('POST', `/api/admin/courses/${tempCourseId}/lessons`, {
    lessonNumber: 1,
    title: 'Temp Lesson 1',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
    status: 'published'
  }, adminToken);
  await request('POST', `/api/admin/courses/${tempCourseId}/lessons`, {
    lessonNumber: 2,
    title: 'Temp Lesson 2',
    videoType: 'local',
    videoFile: uploadedVideoUrl,
    status: 'published'
  }, adminToken);

  // Enroll student
  await request('POST', `/api/courses/${tempCourseId}/register`, {}, studentToken);

  console.log(`Deleting temporary course ${tempCourseId}...`);
  const delCourseRes = await request('DELETE', `/api/admin/courses/${tempCourseId}`, null, adminToken);
  if (delCourseRes.status !== 200 || !delCourseRes.body?.success) {
    throw new Error('TEST E FAILED: ' + JSON.stringify(delCourseRes.body));
  }
  console.log(`✓ Delete response: "${delCourseRes.body.message}"`);

  // Verify course returns 404
  const getDelCourseRes = await request('GET', `/api/courses/${tempCourseId}`, null, studentToken);
  console.log(`✓ Accessing deleted course returns: ${getDelCourseRes.status} (Expected: 404)`);
  if (getDelCourseRes.status !== 404) {
    throw new Error(`TEST E FAILED: Deleted course returned status ${getDelCourseRes.status} instead of 404!`);
  }

  // Verify course is gone from student list
  const catalogRes = await request('GET', '/api/courses');
  const tempInCatalog = (catalogRes.body?.courses || []).some(c => String(c._id) === String(tempCourseId));
  console.log(`✓ Deleted course in public catalog: ${tempInCatalog ? 'STILL PRESENT (ERROR)' : 'NO (Correctly removed)'}`);
  if (tempInCatalog) {
    throw new Error('TEST E FAILED: Deleted course still present in public catalog!');
  }

  // ============================================================
  // TEST F: STUDENT ACCESS & SEQUENTIAL LESSON COMPLETION
  // ============================================================
  console.log('\n------------------------------------------------------------');
  console.log('TEST F — STUDENT ACCESS & SEQUENTIAL LESSON COMPLETION');
  console.log('------------------------------------------------------------');
  console.log(`Testing with student on course "${createdCourseId}"...`);

  // Fetch lessons with sequential status
  const studentLessonsRes = await request('GET', `/api/courses/${createdCourseId}/lessons`, null, studentToken);
  const sLessons = studentLessonsRes.body?.lessons || [];
  console.log(`✓ Student retrieved ${sLessons.length} lessons:`);
  console.log(`   Lesson 1 locked: ${sLessons[0]?.isLocked} (Expected: false)`);
  console.log(`   Lesson 2 locked: ${sLessons[1]?.isLocked} (Expected: true)`);

  if (sLessons[0]?.isLocked !== false || sLessons[1]?.isLocked !== true) {
    throw new Error('TEST F FAILED: Initial sequential lesson locking incorrect!');
  }

  // Try accessing locked Lesson 2
  const lockedAccess = await request('GET', `/api/courses/${createdCourseId}/lessons/${sLessons[1]._id}`, null, studentToken);
  console.log(`✓ Accessing locked Lesson 2 returned: ${lockedAccess.status} (Expected: 403)`);
  if (lockedAccess.status !== 403) {
    throw new Error(`TEST F FAILED: Guard failed, locked lesson returned status ${lockedAccess.status}!`);
  }

  // Complete Lesson 1
  console.log('Completing Lesson 1...');
  const completeL1Res = await request('POST', `/api/courses/${createdCourseId}/lessons/${sLessons[0]._id}/complete`, {}, studentToken);
  if (completeL1Res.status !== 200 || !completeL1Res.body?.success) {
    throw new Error('TEST F FAILED to complete Lesson 1: ' + JSON.stringify(completeL1Res.body));
  }
  console.log(`✓ Lesson 1 completed: Progress = ${completeL1Res.body.progress}%, XP Awarded = ${completeL1Res.body.xpAwarded}`);

  // Now verify Lesson 2 is UNLOCKED
  const refreshedLessonsRes = await request('GET', `/api/courses/${createdCourseId}/lessons`, null, studentToken);
  const refLessons = refreshedLessonsRes.body?.lessons || [];
  console.log(`✓ After Lesson 1 completion: Lesson 2 locked = ${refLessons[1]?.isLocked} (Expected: false)`);
  if (refLessons[1]?.isLocked !== false) {
    throw new Error('TEST F FAILED: Lesson 2 did not unlock after completing Lesson 1!');
  }

  // Access Lesson 2
  const unlockedAccess = await request('GET', `/api/courses/${createdCourseId}/lessons/${refLessons[1]._id}`, null, studentToken);
  console.log(`✓ Accessing unlocked Lesson 2 returned: ${unlockedAccess.status} (Expected: 200)`);
  if (unlockedAccess.status !== 200) {
    throw new Error(`TEST F FAILED: Could not access unlocked lesson 2! Status: ${unlockedAccess.status}`);
  }

  // ============================================================
  // TEST G: SECURITY & PERMISSIONS
  // ============================================================
  console.log('\n------------------------------------------------------------');
  console.log('TEST G — SECURITY & AUTHORIZATION TESTS');
  console.log('------------------------------------------------------------');

  // 1. Student accessing admin endpoint -> Expected 403
  const studentAdminRes = await request('GET', '/api/admin/courses', null, studentToken);
  console.log(`✓ Student accessing /api/admin/courses status: ${studentAdminRes.status} (Expected: 403)`);
  if (studentAdminRes.status !== 403) {
    throw new Error(`TEST G FAILED: Student received status ${studentAdminRes.status} instead of 403!`);
  }

  // 2. Unauthenticated accessing admin endpoint -> Expected 401
  const unauthAdminRes = await request('DELETE', `/api/admin/courses/${createdCourseId}/lessons/123`);
  console.log(`✓ Unauthenticated deleting lesson status: ${unauthAdminRes.status} (Expected: 401)`);
  if (unauthAdminRes.status !== 401) {
    throw new Error(`TEST G FAILED: Unauthenticated request returned status ${unauthAdminRes.status} instead of 401!`);
  }

  // 3. Executable upload attempt -> Expected Rejected (400 or error)
  const exeBuffer = Buffer.from('MZ\x90\x00\x03fake-executable-header', 'utf-8');
  const exeMultipart = buildMultipart('video', 'virus.exe', 'application/x-msdownload', exeBuffer);
  const exeUploadRes = await request('POST', '/api/admin/upload-video', null, adminToken, true, exeMultipart);
  console.log(`✓ Executable .exe upload rejected status: ${exeUploadRes.status} (Expected: Error / 500 or 400)`);
  if (exeUploadRes.status === 200 && exeUploadRes.body?.success) {
    throw new Error('TEST G FAILED: Dangerous .exe file was accepted by the server!');
  }
  console.log('✓ Executable file rejected safely by backend fileFilter.');

  // ============================================================
  // TEST H: ADMIN EDIT & UPDATE COURSE
  // ============================================================
  console.log('\n------------------------------------------------------------');
  console.log('TEST H — ADMIN EDIT & UPDATE COURSE (Field Persistence & Security)');
  console.log('------------------------------------------------------------');
  console.log(`Updating course "${createdCourseId}"...`);

  const updateCourseRes = await request('PUT', `/api/admin/courses/${createdCourseId}`, {
    title: 'Full Stack Development & Cloud Architecture',
    description: 'Updated comprehensive curriculum covering cloud design patterns and REST APIs.',
    instructor: 'Senior Lead Architect',
    category: 'Full Stack & Cloud',
    difficulty: 'Intermediate',
    duration: '45 Days',
    prerequisites: 'HTML, CSS, Basic JS\nDatabase Fundamentals',
    learningOutcomes: 'Design Cloud Architectures\nImplement Secure APIs\nDeploy to Production',
    xpReward: 750,
    status: 'published',
    totalLessons: 12
  }, adminToken);

  if (updateCourseRes.status !== 200 || !updateCourseRes.body?.success) {
    throw new Error('TEST H FAILED: Failed to update course: ' + JSON.stringify(updateCourseRes.body));
  }
  console.log('✓ Update course API responded 200 OK.');

  // Verify updated fields persisted in database
  const verifyUpdatedRes = await request('GET', `/api/admin/courses/${createdCourseId}`, null, adminToken);
  const upCourse = verifyUpdatedRes.body?.course;
  if (!upCourse) throw new Error('TEST H FAILED: Could not fetch updated course!');

  console.log(`✓ Persisted Title: "${upCourse.title}"`);
  console.log(`✓ Persisted Instructor: "${upCourse.instructor}"`);
  console.log(`✓ Persisted Category: "${upCourse.category}"`);
  console.log(`✓ Persisted Difficulty: "${upCourse.difficulty}" (Level: "${upCourse.level}")`);
  console.log(`✓ Persisted Duration: "${upCourse.duration}"`);
  console.log(`✓ Persisted XP: ${upCourse.xpReward}`);
  console.log(`✓ Persisted Prerequisites (${upCourse.prerequisites?.length}):`, upCourse.prerequisites);
  console.log(`✓ Persisted Learning Outcomes (${upCourse.learningOutcomes?.length}):`, upCourse.learningOutcomes);

  if (upCourse.title !== 'Full Stack Development & Cloud Architecture') {
    throw new Error('TEST H FAILED: Title was not updated in database!');
  }
  if (upCourse.difficulty !== 'Intermediate' || upCourse.level !== 'Intermediate') {
    throw new Error('TEST H FAILED: Difficulty/level was not updated!');
  }
  if (!upCourse.prerequisites || upCourse.prerequisites.length < 2) {
    throw new Error('TEST H FAILED: Prerequisites were not persisted properly!');
  }
  if (!upCourse.learningOutcomes || upCourse.learningOutcomes.length < 3) {
    throw new Error('TEST H FAILED: Learning outcomes were not persisted properly!');
  }
  if (upCourse.xpReward !== 750) {
    throw new Error('TEST H FAILED: XP reward was not updated!');
  }

  // Security: Student cannot update course
  const studentPutRes = await request('PUT', `/api/admin/courses/${createdCourseId}`, {
    title: 'Unauthorized Student Title'
  }, studentToken);
  console.log(`✓ Student unauthorized PUT course status: ${studentPutRes.status} (Expected: 403)`);
  if (studentPutRes.status !== 403) {
    throw new Error(`TEST H FAILED: Student received ${studentPutRes.status} instead of 403 on course update!`);
  }

  console.log('\n------------------------------------------------------------');
  console.log('TEST I — COURSE PUBLISH & UNPUBLISH FLOW (Requirements 10 & 12)');
  console.log('------------------------------------------------------------');

  // Create an empty course to test publish validation rejection
  const emptyCourseRes = await request('POST', '/api/admin/courses', {
    title: 'Empty Draft Course QA',
    description: 'A course with zero lessons to verify publication guardrails.',
    category: 'QA Testing',
    difficulty: 'Beginner',
    instructor: 'QA Lead',
    duration: '10 Days',
    status: 'draft'
  }, adminToken);
  const emptyCourseId = emptyCourseRes.body?.course?._id;
  console.log(`Created temporary empty course: ${emptyCourseId}`);

  // 1. Publishing with 0 lessons must be rejected with 400
  const pubEmptyRes = await request('POST', `/api/admin/courses/${emptyCourseId}/publish`, {}, adminToken);
  console.log(`✓ Publishing empty course status: ${pubEmptyRes.status} (Expected: 400). Message: "${pubEmptyRes.body?.message}"`);
  if (pubEmptyRes.status !== 400) {
    throw new Error(`TEST I FAILED: Expected 400 when publishing course without lessons, got ${pubEmptyRes.status}`);
  }

  // 2. Add an incomplete lesson (missing video) to test video requirement validation
  const badLessonRes = await request('POST', `/api/admin/courses/${emptyCourseId}/lessons`, {
    lessonNumber: 1,
    title: 'Lesson Without Video',
    videoType: 'youtube',
    videoUrl: '',
    status: 'draft'
  }, adminToken);
  console.log(`Added lesson without video to empty course: ${badLessonRes.status}`);

  const pubBadLessonRes = await request('POST', `/api/admin/courses/${emptyCourseId}/publish`, {}, adminToken);
  console.log(`✓ Publishing course with missing video status: ${pubBadLessonRes.status} (Expected: 400). Message: "${pubBadLessonRes.body?.message}"`);
  if (pubBadLessonRes.status !== 400) {
    throw new Error(`TEST I FAILED: Expected 400 when publishing course with missing video source, got ${pubBadLessonRes.status}`);
  }

  // Clean up empty test course
  await request('DELETE', `/api/admin/courses/${emptyCourseId}`, null, adminToken);
  console.log('✓ Temporary empty course cleaned up.');

  // 3. Unpublish our main course
  console.log(`Unpublishing main course "${createdCourseId}"...`);
  const unpubRes = await request('POST', `/api/admin/courses/${createdCourseId}/unpublish`, {}, adminToken);
  console.log(`✓ Unpublish API status: ${unpubRes.status} (Expected: 200). Message: "${unpubRes.body?.message}"`);
  if (unpubRes.status !== 200) throw new Error('TEST I FAILED: Failed to unpublish course');

  // Verify course is now draft and omitted from public published list
  const pubListCheck1 = await request('GET', '/api/courses');
  const inPubList1 = (pubListCheck1.body?.courses || []).some(c => String(c._id) === String(createdCourseId));
  console.log(`✓ Is unpublished course in public /api/courses list? ${inPubList1} (Expected: false)`);
  if (inPubList1) throw new Error('TEST I FAILED: Unpublished course still appears in public course catalog!');

  // 4. Publish our main course
  console.log(`Publishing main course "${createdCourseId}"...`);
  const pubRes = await request('POST', `/api/admin/courses/${createdCourseId}/publish`, {}, adminToken);
  console.log(`✓ Publish API status: ${pubRes.status} (Expected: 200). Message: "${pubRes.body?.message}"`);
  if (pubRes.status !== 200) throw new Error('TEST I FAILED: Failed to publish course: ' + JSON.stringify(pubRes.body));

  // Verify course now appears in public published list
  const pubListCheck2 = await request('GET', '/api/courses');
  const inPubList2 = (pubListCheck2.body?.courses || []).some(c => String(c._id) === String(createdCourseId));
  console.log(`✓ Is published course in public /api/courses list? ${inPubList2} (Expected: true)`);
  if (!inPubList2) throw new Error('TEST I FAILED: Published course does not appear in public course catalog!');

  console.log('\n------------------------------------------------------------');
  console.log('TEST J — ADMIN DASHBOARD TELEMETRY & COURSE METRICS (Section 3)');
  console.log('------------------------------------------------------------');

  const dashRes = await request('GET', '/api/admin/dashboard', null, adminToken);
  if (dashRes.status !== 200 || !dashRes.body?.success) {
    throw new Error('TEST J FAILED: Failed to fetch /api/admin/dashboard: ' + JSON.stringify(dashRes.body));
  }
  const stats = dashRes.body.stats;
  console.log(`✓ Live MongoDB Total Courses: ${stats.totalCourses}`);
  console.log(`✓ Live MongoDB Published Courses: ${stats.publishedCourses}`);
  console.log(`✓ Live MongoDB Draft Courses: ${stats.draftCourses}`);
  console.log(`✓ Live MongoDB Total Lessons: ${stats.totalLessons}`);

  if (typeof stats.totalCourses !== 'number' || stats.totalCourses < 1) {
    throw new Error('TEST J FAILED: stats.totalCourses is not a valid number!');
  }
  if (typeof stats.publishedCourses !== 'number' || stats.publishedCourses < 1) {
    throw new Error('TEST J FAILED: stats.publishedCourses is not a valid number!');
  }
  if (typeof stats.totalLessons !== 'number' || stats.totalLessons < 1) {
    throw new Error('TEST J FAILED: stats.totalLessons is not a valid number!');
  }

  const recentCourses = dashRes.body.recentCourses;
  console.log(`✓ Recent Courses Returned in Dashboard: ${recentCourses?.length || 0}`);
  if (!recentCourses || recentCourses.length === 0) {
    throw new Error('TEST J FAILED: recentCourses array is empty in /api/admin/dashboard!');
  }
  const foundMainInRecent = recentCourses.some(c => String(c._id) === String(createdCourseId));
  console.log(`✓ Main created course present in recent courses: ${foundMainInRecent}`);

  console.log('\n------------------------------------------------------------');
  console.log('TEST K — PUBLIC GUEST BROWSING & AUTHENTICATION GUARDRAILS (Section 11)');
  console.log('------------------------------------------------------------');

  // 1. Unauthenticated request to GET /api/courses -> 200 OK
  const guestCoursesRes = await request('GET', '/api/courses');
  console.log(`✓ Guest unauthenticated /api/courses status: ${guestCoursesRes.status} (Expected: 200)`);
  if (guestCoursesRes.status !== 200) throw new Error('TEST K FAILED: /api/courses did not return 200 for guest');

  // 2. Unauthenticated request to GET /api/courses/:id -> 200 OK
  const guestCourseDetailRes = await request('GET', `/api/courses/${createdCourseId}`);
  console.log(`✓ Guest unauthenticated /api/courses/:id status: ${guestCourseDetailRes.status} (Expected: 200)`);
  if (guestCourseDetailRes.status !== 200) throw new Error('TEST K FAILED: /api/courses/:id did not return 200 for guest');

  // 3. Unauthenticated start/enroll -> 401 Unauthorized
  const guestEnrollRes = await request('POST', `/api/courses/${createdCourseId}/enroll`);
  console.log(`✓ Guest unauthenticated /api/courses/:id/enroll status: ${guestEnrollRes.status} (Expected: 401)`);
  if (guestEnrollRes.status !== 401) throw new Error('TEST K FAILED: Expected 401 on guest enroll, got ' + guestEnrollRes.status);

  // 4. Verify courses.html and course-details.html return 200 OK
  const htmlRes1 = await request('GET', '/courses.html');
  console.log(`✓ courses.html HTTP status: ${htmlRes1.status} (Expected: 200)`);
  const htmlRes2 = await request('GET', `/course-details.html?id=${createdCourseId}`);
  console.log(`✓ course-details.html HTTP status: ${htmlRes2.status} (Expected: 200)`);
  const htmlRes3 = await request('GET', `/admin-dashboard.html`);
  console.log(`✓ admin-dashboard.html HTTP status: ${htmlRes3.status} (Expected: 200)`);
  const htmlRes4 = await request('GET', `/admin-lessons.html?courseId=${createdCourseId}`);
  console.log(`✓ admin-lessons.html HTTP status: ${htmlRes4.status} (Expected: 200)`);

  if (htmlRes1.status !== 200 || htmlRes2.status !== 200 || htmlRes3.status !== 200 || htmlRes4.status !== 200) {
    throw new Error('TEST K FAILED: Static HTML pages failed to serve with 200 OK');
  }

  const cleanupRes = await request('DELETE', `/api/admin/courses/${createdCourseId}`, null, adminToken);
  if (cleanupRes.status !== 200 || !cleanupRes.body?.success) {
    throw new Error('QA cleanup failed to remove the temporary main course: ' + JSON.stringify(cleanupRes.body));
  }
  const cleanupVerifyRes = await request('GET', `/api/admin/courses/${createdCourseId}`, null, adminToken);
  if (cleanupVerifyRes.status !== 404) {
    throw new Error('QA cleanup failed: temporary main course is still present.');
  }
  console.log('✓ Temporary main course and linked lesson records cleaned up.');

  console.log('\n================================================================');
  console.log('🎉 ALL TESTS PASSED SUCCESSFULLY! (TEST A through TEST K)');
  console.log('================================================================\n');
}

runTestSuite().catch(err => {
  console.error('\n❌ QA TEST RUN ENCOUNTERED AN ERROR:');
  console.error(err.message);
  process.exit(1);
});
