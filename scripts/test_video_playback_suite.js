const http = require('http');
const path = require('path');
const fs = require('fs');

const BACKEND_BASE = 'http://127.0.0.1:5000';
const FRONTEND_BASE = 'http://127.0.0.1:3000';

function request(baseUrl, method, reqPath, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, baseUrl);
    const reqHeaders = { ...headers };
    if (data && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
    }

    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        let parsed = null;
        try { parsed = JSON.parse(body); } catch (_) { parsed = body; }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: parsed,
          raw: body
        });
      });
    });
    req.on('error', reject);
    if (data) {
      if (typeof data === 'string' || Buffer.isBuffer(data)) {
        req.write(data);
      } else {
        req.write(JSON.stringify(data));
      }
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

async function runTests() {
  console.log('====================================================');
  console.log('EDUTECH NEXUS - VIDEO PLAYBACK & STREAMING QA SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
      throw new Error(`Assertion failed: ${message}`);
    }
  }

  // 1. Authenticate Admin and Student
  console.log('[SETUP] Logging in...');
  const adminLogin = await request(BACKEND_BASE, 'POST', '/api/auth/login', {
    email: 'adminedutech001@gmail.com',
    password: 'Admin@edutech'
  });
  assert(adminLogin.status === 200 && adminLogin.body?.token, 'Admin login succeeded');
  const adminToken = adminLogin.body.token;

  const studentLogin = await request(BACKEND_BASE, 'POST', '/api/auth/login', {
    email: 'student@edutechnexus.com',
    password: 'Student@123'
  });
  assert(studentLogin.status === 200 && studentLogin.body?.token, 'Student login succeeded');
  const studentToken = studentLogin.body.token;

  // Get courses list
  const coursesRes = await request(BACKEND_BASE, 'GET', '/api/courses');
  assert(coursesRes.status === 200 && coursesRes.body.courses?.length > 0, 'Course catalog loaded');
  const testCourse = coursesRes.body.courses[0];
  const courseId = String(testCourse._id);

  // Enroll student if not already enrolled
  await request(BACKEND_BASE, 'POST', `/api/courses/${courseId}/register`, {}, {
    Authorization: `Bearer ${studentToken}`
  });

  // TEST 1: Test a valid local MP4 lesson video streaming
  console.log('\n[TEST 1] Valid local MP4 video streaming');
  const sampleMp4Buf = Buffer.from('ftypmp42\0\0\0\0isommp42MockValidMP4DataForTestingStreamingRanges', 'utf-8');
  const mp4Multipart = buildMultipart('video', 'test_local_sample.mp4', 'video/mp4', sampleMp4Buf);
  const mp4Upload = await request(BACKEND_BASE, 'POST', '/api/admin/upload-video', mp4Multipart.buffer, {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': `multipart/form-data; boundary=${mp4Multipart.boundary}`
  });
  assert(mp4Upload.status === 200 && mp4Upload.body?.videoUrl, `Uploaded test MP4: ${mp4Upload.body?.videoUrl}`);
  const mp4Path = mp4Upload.body.videoUrl;

  // Stream MP4 from backend
  const streamMp4Res = await request(BACKEND_BASE, 'GET', mp4Path);
  assert(streamMp4Res.status === 200, `Backend returns HTTP 200 for local MP4`);
  assert(streamMp4Res.headers['content-type'] === 'video/mp4', `Content-Type is video/mp4`);
  assert(streamMp4Res.headers['accept-ranges'] === 'bytes', `Accept-Ranges: bytes header present`);

  // Stream MP4 from frontend-server (port 3000)
  const streamMp4FeRes = await request(FRONTEND_BASE, 'GET', mp4Path);
  assert(streamMp4FeRes.status === 200, `Frontend server returns HTTP 200 for local MP4`);
  assert(streamMp4FeRes.headers['content-type'] === 'video/mp4', `Frontend server Content-Type is video/mp4`);

  // TEST 2: Test a valid WebM lesson video
  console.log('\n[TEST 2] Valid WebM video upload & streaming');
  const sampleWebmBuf = Buffer.from('\x1A\x45\xDF\xA3WebM_Mock_Test_Buffer_Payload_Data', 'utf-8');
  const webmMultipart = buildMultipart('video', 'test_sample.webm', 'video/webm', sampleWebmBuf);
  const webmUpload = await request(BACKEND_BASE, 'POST', '/api/admin/upload-video', webmMultipart.buffer, {
    Authorization: `Bearer ${adminToken}`,
    'Content-Type': `multipart/form-data; boundary=${webmMultipart.boundary}`
  });
  assert(webmUpload.status === 200 && webmUpload.body?.videoUrl, `Uploaded test WebM: ${webmUpload.body?.videoUrl}`);
  const webmPath = webmUpload.body.videoUrl;

  const streamWebmRes = await request(BACKEND_BASE, 'GET', webmPath);
  assert(streamWebmRes.status === 200, `Backend returns HTTP 200 for WebM`);
  assert(streamWebmRes.headers['content-type'] === 'video/webm', `Content-Type is video/webm`);

  const streamWebmFeRes = await request(FRONTEND_BASE, 'GET', webmPath);
  assert(streamWebmFeRes.status === 200, `Frontend server returns HTTP 200 for WebM`);
  assert(streamWebmFeRes.headers['content-type'] === 'video/webm', `Frontend server Content-Type is video/webm`);

  // TEST 3: Test a valid public YouTube video lesson
  console.log('\n[TEST 3] Valid public YouTube video handling');
  const addYtLesson = await request(BACKEND_BASE, 'POST', `/api/admin/courses/${courseId}/lessons`, {
    title: 'YouTube Test Lesson QA',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    status: 'published'
  }, { Authorization: `Bearer ${adminToken}` });
  assert(addYtLesson.status === 201, 'Created lesson with public YouTube URL');
  const ytLessonId = addYtLesson.body.lesson._id;

  // Retrieve via student endpoint
  const getStudentYtLesson = await request(BACKEND_BASE, 'GET', `/api/courses/${courseId}/lessons/${ytLessonId}`, null, {
    Authorization: `Bearer ${studentToken}`
  });
  assert(getStudentYtLesson.status === 200, 'Student retrieved YouTube lesson');
  assert(getStudentYtLesson.body.lesson.videoType === 'youtube', 'Lesson videoType is youtube');
  assert(getStudentYtLesson.body.lesson.youtubeVideoId === 'kqtD5dpn9C8', 'Extracted YouTube Video ID matches: kqtD5dpn9C8');
  assert(getStudentYtLesson.body.lesson.videoUrl.includes('kqtD5dpn9C8'), 'YouTube URL contains correct ID');

  // TEST 4: Invalid or missing video URL returns clear 404
  console.log('\n[TEST 4] Missing video URL handling (404 verification & no fake fallback)');
  const missingVidRes = await request(BACKEND_BASE, 'GET', '/uploads/course-videos/non_existent_file_987654.mp4');
  assert(missingVidRes.status === 404, `Missing backend video returns 404 (Got: ${missingVidRes.status})`);

  const missingFeVidRes = await request(FRONTEND_BASE, 'GET', '/uploads/course-videos/non_existent_file_987654.mp4');
  assert(missingFeVidRes.status === 404, `Missing frontend server video returns 404 (Got: ${missingFeVidRes.status})`);

  // Verify missing video did NOT return sample-lesson.mp4
  const sampleLessonPath = path.join(__dirname, '..', 'frontend', 'videos', 'sample-lesson.mp4');
  if (fs.existsSync(sampleLessonPath)) {
    const sampleSize = fs.statSync(sampleLessonPath).size;
    assert(Number(missingVidRes.headers['content-length'] || 0) !== sampleSize, 'Missing video did not silently send sample-lesson.mp4');
  }

  // Create lesson with invalid YouTube URL and verify student API does NOT inject dummy JMUxmLyrhSk
  const addInvalidYtLesson = await request(BACKEND_BASE, 'POST', `/api/admin/courses/${courseId}/lessons`, {
    title: 'Invalid YouTube Test',
    videoType: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=invalid_link',
    status: 'draft'
  }, { Authorization: `Bearer ${adminToken}` });
  const invalidLessonId = addInvalidYtLesson.body.lesson._id;

  const getInvalidLesson = await request(BACKEND_BASE, 'GET', `/api/courses/${courseId}/lessons/${invalidLessonId}`, null, {
    Authorization: `Bearer ${studentToken}`
  });
  assert(getInvalidLesson.body.lesson.youtubeVideoId !== 'JMUxmLyrhSk', 'Invalid YouTube link does NOT inject dummy JMUxmLyrhSk ID');

  // TEST 5: Test lesson switching
  console.log('\n[TEST 5] Lesson switching');
  const allLessonsRes = await request(BACKEND_BASE, 'GET', `/api/courses/${courseId}/lessons`, null, {
    Authorization: `Bearer ${studentToken}`
  });
  assert(allLessonsRes.status === 200 && allLessonsRes.body.lessons?.length >= 2, 'Retrieved all course lessons');
  const l1 = allLessonsRes.body.lessons[0];
  const l2 = allLessonsRes.body.lessons[1];

  const fetchL1 = await request(BACKEND_BASE, 'GET', `/api/courses/${courseId}/lessons/${l1._id}`, null, {
    Authorization: `Bearer ${studentToken}`
  });
  const fetchL2 = await request(BACKEND_BASE, 'GET', `/api/courses/${courseId}/lessons/${l2._id}`, null, {
    Authorization: `Bearer ${studentToken}`
  });
  assert(fetchL1.body.lesson.title === l1.title, `Lesson 1 fetched: "${l1.title}"`);
  assert(fetchL2.body.lesson.title === l2.title, `Lesson 2 fetched: "${l2.title}"`);
  assert(String(fetchL1.body.lesson._id) !== String(fetchL2.body.lesson._id), 'Distinct lesson IDs verified on switch');

  // TEST 6: Video seeking and partial HTTP requests
  console.log('\n[TEST 6] HTTP Byte-Range requests and seeking (206, 416, Content-Range)');
  // Partial range request: bytes=0-15
  const range1Res = await request(BACKEND_BASE, 'GET', mp4Path, null, {
    Range: 'bytes=0-15'
  });
  assert(range1Res.status === 206, `HTTP 206 Partial Content returned (Got: ${range1Res.status})`);
  assert(range1Res.headers['content-range'].startsWith('bytes 0-15/'), `Content-Range header correct: ${range1Res.headers['content-range']}`);
  assert(range1Res.headers['content-length'] === '16', `Content-Length is 16 for bytes=0-15`);
  assert(range1Res.headers['accept-ranges'] === 'bytes', `Accept-Ranges header is bytes`);

  // Partial range request on frontend-server
  const feRangeRes = await request(FRONTEND_BASE, 'GET', mp4Path, null, {
    Range: 'bytes=0-15'
  });
  assert(feRangeRes.status === 206, `Frontend server HTTP 206 Partial Content returned`);
  assert(feRangeRes.headers['content-range'].startsWith('bytes 0-15/'), `Frontend server Content-Range correct: ${feRangeRes.headers['content-range']}`);

  // Invalid range request -> 416 Range Not Satisfiable
  const invalidRangeRes = await request(BACKEND_BASE, 'GET', mp4Path, null, {
    Range: 'bytes=9999999-9999999'
  });
  assert(invalidRangeRes.status === 416, `Invalid Range returns HTTP 416 Range Not Satisfiable (Got: ${invalidRangeRes.status})`);
  assert(Boolean(invalidRangeRes.headers['content-range']), `Content-Range header present on 416`);

  const feInvalidRangeRes = await request(FRONTEND_BASE, 'GET', mp4Path, null, {
    Range: 'bytes=9999999-9999999'
  });
  assert(feInvalidRangeRes.status === 416, `Frontend server invalid Range returns HTTP 416`);

  // TEST 7: Test video playback after refreshing the page
  console.log('\n[TEST 7] Page refresh persistence & direct lesson route');
  const directLessonRes = await request(BACKEND_BASE, 'GET', `/api/courses/${courseId}/lessons/${l1.lessonNumber || 1}`, null, {
    Authorization: `Bearer ${studentToken}`
  });
  assert(directLessonRes.status === 200, `Direct query by lessonNumber returns HTTP 200`);
  assert(directLessonRes.body.lesson.title === l1.title, `Same lesson title returned after direct navigation`);

  // TEST 8: Test the lesson flow using student account
  console.log('\n[TEST 8] Student curriculum access and enrollment');
  assert(Boolean(allLessonsRes.body.enrollment), 'Enrollment object returned with student lessons');
  assert(typeof allLessonsRes.body.enrollment.progress === 'number', 'Student progress is a number');

  // TEST 9: Test lesson completion and XP rewards
  console.log('\n[TEST 9] Lesson completion & XP reward verification');
  const completeRes = await request(BACKEND_BASE, 'POST', `/api/courses/${courseId}/lessons/${l1._id}/complete`, {
    lessonNumber: l1.lessonNumber || 1
  }, { Authorization: `Bearer ${studentToken}` });
  assert(completeRes.status === 200 && completeRes.body.success, 'Lesson marked complete');
  assert(completeRes.body.progress > 0, `Progress increased: ${completeRes.body.progress}%`);
  assert(Array.isArray(completeRes.body.completedLessons), 'completedLessons array updated');

  // TEST 10: Unrelated application features remain functional
  console.log('\n[TEST 10] Regression check on unrelated application features');
  const internshipsRes = await request(BACKEND_BASE, 'GET', '/api/internships');
  assert(internshipsRes.status === 200, 'Internships endpoint operational');

  const eventsRes = await request(BACKEND_BASE, 'GET', '/api/events');
  assert(eventsRes.status === 200, 'Events endpoint operational');

  const clubsRes = await request(BACKEND_BASE, 'GET', '/api/clubs');
  assert(clubsRes.status === 200, 'Clubs endpoint operational');

  const profileRes = await request(BACKEND_BASE, 'GET', '/api/users/profile', null, {
    Authorization: `Bearer ${studentToken}`
  });
  assert(profileRes.status === 200, 'User profile endpoint operational');

  console.log('\n====================================================');
  console.log(`ALL TESTS PASSED! (${passed} checks passed, ${failed} failed)`);
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('\nQA SUITE EXECUTION FAILED:', err);
  process.exit(1);
});
