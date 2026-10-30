const http = require('http');

function post(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(b) }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname,
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(b) }));
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  // Login as student
  console.log('Logging in as student...');
  const loginRes = await post('http://localhost:5000/api/auth/login', {
    login: 'student@edutechnexus.com',
    password: 'Student@123'
  });
  console.log('Login status:', loginRes.status);
  const token = loginRes.body?.token;

  // Get courses list
  const coursesRes = await get('http://localhost:5000/api/courses', token);
  console.log('Courses count:', coursesRes.body?.courses?.length);
  const firstCourse = coursesRes.body?.courses[0];
  console.log('First course:', firstCourse?.title, 'ID:', firstCourse?._id, 'isEnrolled:', firstCourse?.isEnrolled);

  // Get course details
  const detailsRes = await get(`http://localhost:5000/api/courses/${firstCourse._id}`, token);
  console.log('Details status:', detailsRes.status, 'isEnrolled:', detailsRes.body?.isEnrolled);

  // Register / Start course
  console.log('Enrolling in course...');
  const enrollRes = await post(`http://localhost:5000/api/courses/${firstCourse._id}/register`, {}, token);
  console.log('Enroll status:', enrollRes.status, 'Body:', enrollRes.body);

  // Get course lessons
  console.log('Fetching lessons...');
  const lessonsRes = await get(`http://localhost:5000/api/courses/${firstCourse._id}/lessons`, token);
  console.log('Lessons status:', lessonsRes.status, 'Lessons count:', lessonsRes.body?.lessons?.length);
  if (lessonsRes.body?.lessons?.length > 0) {
    console.log('Lesson 1:', lessonsRes.body.lessons[0]);
  }
}

run().catch(console.error);
