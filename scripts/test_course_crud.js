const http = require('http');

const PORT = 5000;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function request(method, reqPath, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(reqPath, BASE_URL);
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (data) headers['Content-Type'] = 'application/json';

    const req = http.request(url, { method, headers }, (res) => {
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

async function run() {
  console.log('--- 1. Login as Admin ---');
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'adminedutech001@gmail.com',
    password: 'Admin@edutech'
  });
  console.log('Admin login status:', adminLogin.status, 'token exists:', !!adminLogin.body?.token);
  const adminToken = adminLogin.body.token;

  console.log('--- 2. Login as Student ---');
  const studentLogin = await request('POST', '/api/auth/login', {
    email: 'student@edutechnexus.com',
    password: 'Student@123'
  });
  console.log('Student login status:', studentLogin.status, 'token exists:', !!studentLogin.body?.token);
  const studentToken = studentLogin.body.token;

  console.log('--- 3. Admin creates course ---');
  const createRes = await request('POST', '/api/admin/courses', {
    title: 'Test Course For Edit Delete ' + Date.now(),
    description: 'Initial description before edit',
    category: 'Web Development',
    instructor: 'Instructor Original',
    duration: '4 Weeks',
    difficulty: 'Beginner',
    prerequisites: 'Basic PC skills',
    learningOutcomes: 'Outcome 1, Outcome 2',
    xpReward: 300,
    status: 'draft',
    totalLessons: 5
  }, adminToken);
  console.log('Create course status:', createRes.status, 'id:', createRes.body?.course?._id);
  const courseId = createRes.body?.course?._id;

  console.log('--- 4. Admin edits / updates course ---');
  const updateRes = await request('PUT', `/api/admin/courses/${courseId}`, {
    title: 'Updated Course Title ' + Date.now(),
    description: 'Updated comprehensive course description with new syllabus.',
    category: 'Artificial Intelligence',
    instructor: 'Dr. Jane Smith',
    duration: '8 Weeks',
    difficulty: 'Intermediate',
    prerequisites: 'Python knowledge\nLinear Algebra',
    learningOutcomes: 'Master Deep Learning\nBuild Transformers',
    xpReward: 600,
    status: 'published',
    totalLessons: 8
  }, adminToken);
  console.log('Update course status:', updateRes.status, 'message:', updateRes.body?.message);
  console.log('Updated title in response:', updateRes.body?.course?.title);
  console.log('Updated category in response:', updateRes.body?.course?.category);
  console.log('Updated prerequisites in response:', updateRes.body?.course?.prerequisites);
  console.log('Updated learningOutcomes in response:', updateRes.body?.course?.learningOutcomes);

  console.log('--- 5. Verify persistence in DB ---');
  const getRes = await request('GET', `/api/admin/courses/${courseId}`, null, adminToken);
  console.log('Fetch updated course status:', getRes.status);
  console.log('Persisted difficulty:', getRes.body?.course?.difficulty);
  console.log('Persisted level:', getRes.body?.course?.level);
  console.log('Persisted status:', getRes.body?.course?.status);
  console.log('Persisted xpReward:', getRes.body?.course?.xpReward);
  console.log('Persisted totalLessons:', getRes.body?.course?.totalLessons);

  console.log('--- 6. Security check: Student trying to update course ---');
  const studentUpdateRes = await request('PUT', `/api/admin/courses/${courseId}`, {
    title: 'Hacked Title'
  }, studentToken);
  console.log('Student PUT status (expect 403):', studentUpdateRes.status);

  console.log('--- 7. Security check: Student trying to delete course ---');
  const studentDeleteRes = await request('DELETE', `/api/admin/courses/${courseId}`, null, studentToken);
  console.log('Student DELETE status (expect 403):', studentDeleteRes.status);

  console.log('--- 8. Admin deletes course permanently ---');
  const deleteRes = await request('DELETE', `/api/admin/courses/${courseId}`, null, adminToken);
  console.log('Delete status:', deleteRes.status, 'message:', deleteRes.body?.message);

  console.log('--- 9. Verify course is 404 after delete ---');
  const getAfterDelete = await request('GET', `/api/admin/courses/${courseId}`, null, adminToken);
  console.log('Get after delete status (expect 404):', getAfterDelete.status);
}

run().catch(console.error);
