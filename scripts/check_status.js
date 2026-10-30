const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/.env') });

const Course = require('../backend/models/Course');
const Company = require('../backend/models/Company');
const Internship = require('../backend/models/Internship');
const Game = require('../backend/models/Game');
const GameQuestion = require('../backend/models/GameQuestion');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edutech_nexus');
  console.log('Connected to MongoDB.');

  const courses = await Course.find({}, 'title slug totalLessons lessons');
  console.log(`Courses (${courses.length}):`);
  courses.forEach(c => console.log(`  - ${c.title} (${c.lessons?.length || 0} lessons)`));

  const companies = await Company.find({}, 'name verificationStatus isExample');
  console.log(`Companies (${companies.length}):`);
  companies.forEach(c => console.log(`  - ${c.name} [${c.verificationStatus}]`));

  const internships = await Internship.find({}, 'title company');
  console.log(`Internships (${internships.length}):`);
  internships.forEach(i => console.log(`  - ${i.title} @ ${i.company}`));

  const games = await Game.find({}, 'title gameType status');
  console.log(`Games (${games.length}):`);
  games.forEach(g => console.log(`  - ${g._id} | ${g.title} | ${g.gameType}`));

  const questions = await GameQuestion.find({}, 'gameId gameType category level question');
  console.log(`GameQuestions (${questions.length}):`);
  questions.forEach(q => console.log(`  - [${q.gameType} / Lvl ${q.level}] ${q.category}: ${q.question.substring(0, 40)}...`));

  await mongoose.disconnect();
}

check().catch(console.error);
