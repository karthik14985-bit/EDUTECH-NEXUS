require('../backend/node_modules/dotenv').config({ path: require('path').join(__dirname, '../backend/.env') });
const mongoose = require('../backend/node_modules/mongoose');
const connectDatabase = require('../backend/config/db');
const Course = require('../backend/models/Course');

async function main() {
  await connectDatabase();
  const courses = await Course.find({});
  console.log(`Found ${courses.length} courses:`);
  courses.forEach(c => {
    console.log(`- [${c._id}] ${c.title} (${c.lessons ? c.lessons.length : 0} lessons)`);
  });
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
