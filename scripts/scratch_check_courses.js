const mongoose = require('../backend/node_modules/mongoose');

async function check() {
  await mongoose.connect('mongodb://127.0.0.1:27017/edutech_nexus');
  const Course = mongoose.model('Course', new mongoose.Schema({}, { strict: false }));
  const courses = await Course.find({});
  console.log('Total courses:', courses.length);
  for (const c of courses) {
    console.log(`- ID: ${c._id} | Title: "${c.title}" | Slug: "${c.slug}" | Lessons: ${c.lessons?.length || 0}`);
    if (c.lessons && c.lessons.length > 0) {
      console.log('   Lesson 1:', {
        title: c.lessons[0].title,
        videoType: c.lessons[0].videoType,
        youtubeVideoId: c.lessons[0].youtubeVideoId,
        videoUrl: c.lessons[0].videoUrl,
        videoFile: c.lessons[0].videoFile
      });
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const users = await User.find({});
  console.log('\nUsers count:', users.length);
  for (const u of users) {
    console.log(`- User: ${u.email} (${u.role}) ID: ${u._id}`);
  }
  const CourseEnrollment = mongoose.model('CourseEnrollment', new mongoose.Schema({}, { strict: false }));
  const enrollments = await CourseEnrollment.find({});
  console.log('\nEnrollments count:', enrollments.length);
  for (const en of enrollments) {
    console.log(`- Enrollment: user=${en.userId || en.studentId || en.user} course=${en.courseId || en.course} progress=${en.progress} completedLessons=${JSON.stringify(en.completedLessons)}`);
  }
  process.exit(0);
}

check().catch(console.error);
