const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Course = require('../models/Course');
const Company = require('../models/Company');
const Internship = require('../models/Internship');
const { repairRepeatedCloudInternshipTitles } = require('./internshipTitleRepair');
const { repairRepeatedTechnicalEventTitles } = require('./eventTitleRepair');
const XPConfig = require('../models/XPConfig');
const {
  backupAndDeduplicateCourseRecords,
  hasSampleVideo,
  removeSampleVideoMappings
} = require('./courseDataRepair');

async function ensureAccount(filter, accountData) {
  const existing = await User.findOne(filter);
  return existing || User.create(accountData);
}

async function ensureDefaultAccounts() {
  try {
    // 1. XP Config
    await XPConfig.findOneAndUpdate(
      { key: 'default_xp_config' },
      {
        key: 'default_xp_config',
        courseRegistration: 10,
        lessonCompletion: 20,
        courseCompletion: 100,
        certificateClaim: 150,
        eventParticipation: 50,
        gameParticipation: 20,
        gameAchievement: 50
      },
      { upsert: true }
    );

    // 2. Ensure Admin Account
    const adminEmail = (process.env.ADMIN_EMAIL || 'adminedutech001@gmail.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@edutech';
    const adminHash = await bcrypt.hash(adminPassword, 12);

    const admin = await ensureAccount(
      { $or: [{ email: adminEmail }, { username: 'admin' }, { role: 'admin' }] },
      {
        fullName: 'System Administrator',
        email: adminEmail,
        username: 'admin',
        password: adminHash,
        phone: '9000000000',
        registerNumber: 'ADMIN-001',
        studentId: 'ADMIN-001',
        institution: 'EDUTECH NEXUS HQ',
        college: 'EDUTECH NEXUS HQ',
        department: 'Platform Operations',
        userType: 'staff',
        role: 'admin',
        isActive: true,
        xp: 9999,
        level: 10
      }
    );
    console.log(`[BOOT] ✅ Admin account verified: ${admin.email} (Username: admin)`);

    // 3. Ensure Demo Student Account
    const studentEmail = (process.env.STUDENT_EMAIL || 'student@edutechnexus.com').toLowerCase().trim();
    const studentPassword = process.env.STUDENT_PASSWORD || 'Student@123';
    const studentHash = await bcrypt.hash(studentPassword, 12);

    await ensureAccount(
      { email: studentEmail },
      {
        fullName: 'Karthi Kumar',
        email: studentEmail,
        username: 'student',
        password: studentHash,
        phone: '9876543200',
        age: 21,
        gender: 'Male',
        userType: 'student',
        institution: 'PSG College of Technology',
        college: 'PSG College of Technology',
        department: 'Computer Science & Engineering',
        year: '3',
        registerNumber: '71772101001',
        studentId: '71772101001',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        role: 'student',
        isActive: true,
        xp: 520,
        level: 3
      }
    );

    // 4. Ensure Sudesh Kumar account
    await ensureAccount(
      { email: 'sudeshkumar@edutechnexus.com' },
      {
        fullName: 'Sudeshkumar M',
        email: 'sudeshkumar@edutechnexus.com',
        username: 'sudesh',
        password: studentHash,
        phone: '9876543210',
        age: 21,
        gender: 'Male',
        userType: 'student',
        institution: 'PSG College of Technology',
        college: 'PSG College of Technology',
        department: 'Artificial Intelligence & Data Science',
        year: '3',
        registerNumber: 'EDU-STU-001',
        studentId: 'EDU-STU-001',
        city: 'Coimbatore',
        state: 'Tamil Nadu',
        role: 'student',
        isActive: true,
        xp: 680,
        level: 3
      }
    );

    // 5. Ensure Staff, Worker, and Other Demo Accounts for comprehensive testing
    await ensureAccount(
      { email: 'staff@edutechnexus.com' },
      {
        fullName: 'Dr. R. Ramanathan',
        email: 'staff@edutechnexus.com',
        username: 'staff_demo',
        password: studentHash,
        phone: '9876543220',
        age: 42,
        gender: 'Male',
        userType: 'staff',
        institution: 'Anna University',
        college: 'Anna University',
        department: 'Computer Technology',
        designation: 'Associate Professor',
        city: 'Chennai',
        state: 'Tamil Nadu',
        role: 'student',
        isActive: true,
        xp: 300,
        level: 2
      }
    );

    await ensureAccount(
      { email: 'worker@edutechnexus.com' },
      {
        fullName: 'Senthil V',
        email: 'worker@edutechnexus.com',
        username: 'worker_demo',
        password: studentHash,
        phone: '9876543230',
        age: 28,
        gender: 'Male',
        userType: 'worker',
        company: 'Zoho Corporation',
        designation: 'Senior Frontend Engineer',
        city: 'Chennai',
        state: 'Tamil Nadu',
        role: 'student',
        isActive: true,
        xp: 450,
        level: 2
      }
    );

    const courseRepair = await backupAndDeduplicateCourseRecords();
    if (courseRepair.backupPath) {
      console.log(
        `[BOOT] Course repair backup written to ${courseRepair.backupPath}; ` +
        `removed ${courseRepair.removedCourses} duplicate course records and ` +
        `${courseRepair.removedLessons} duplicate lesson records.`
      );
    }

    // 6. Ensure exactly 4 core courses with 10 lessons each and quizzes
    const exact4Courses = require('../seed/coursesData');
    const Quiz = require('../models/Quiz');

    if (Array.isArray(exact4Courses)) {
      // Ensure the core starter courses are initialized without deleting admin-created courses

      for (const c of exact4Courses) {
        const existing = await Course.findOne({ title: c.title });
        let savedCourse;
        if (existing) {
          existing.slug = c.slug;
          existing.description = c.description;
          existing.image = c.image;
          existing.thumbnail = c.thumbnail;
          existing.instructor = c.instructor;
          existing.duration = c.duration;
          existing.difficulty = c.difficulty;
          existing.xp = c.xp;
          existing.xpReward = c.xp;
          existing.totalLessons = c.lessons.length;
          existing.requirements = c.requirements;
          existing.learningOutcomes = c.learningOutcomes;
          existing.whatYouWillLearn = c.learningOutcomes;
          const currentLessons = (existing.lessons || []).map(lesson => lesson.toObject());
          existing.lessons = c.lessons.map((lesson, index) => {
            const lessonNumber = lesson.lessonNumber || index + 1;
            const currentLesson = currentLessons.find(
              current => Number(current.lessonNumber || current.order) === Number(lessonNumber)
            );
            if (!currentLesson) return lesson;

            const mergedLesson = {
              ...lesson,
              ...currentLesson,
              _id: currentLesson._id,
              lessonNumber,
              order: lesson.order || lessonNumber
            };
            if (hasSampleVideo(currentLesson)) {
              for (const field of ['videoType', 'videoUrl', 'youtubeVideoId', 'videoFile']) {
                mergedLesson[field] = lesson[field] || '';
              }
            }
            return mergedLesson;
          });
          existing.status = 'active';
          savedCourse = await existing.save();
        } else {
          savedCourse = await Course.create({ ...c, status: 'active' });
        }

        if (c.quiz && c.quiz.questions) {
          await Quiz.findOneAndUpdate(
            { courseId: savedCourse._id },
            {
              courseId: savedCourse._id,
              questions: c.quiz.questions.map(q => ({
                question: q.questionText || q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation
              })),
              passPercentage: c.quiz.passPercentage || 70
            },
            { upsert: true, new: true }
          );
        }
      }
      console.log(`[BOOT] ✅ ${exact4Courses.length} core courses synchronized with 10 lessons each`);
    }

    const removedSampleMappings = await removeSampleVideoMappings();
    if (removedSampleMappings) {
      console.log(`[BOOT] Removed ${removedSampleMappings} incorrect sample video mappings.`);
    }

    // 7. Ensure Example Companies
    const companiesData = [
      {
        name: 'Tata Consultancy Services',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
        about: 'Tata Consultancy Services is a global leader in IT services, consulting, and business solutions.',
        description: 'TCS partners with many of the world’s largest businesses in their transformation journeys. Note: This is an example company record for student learning simulations.',
        industry: 'Information Technology & Consulting',
        website: 'https://www.tcs.com',
        email: 'careers-info@tcs.example.com',
        phone: '+91 22 6778 9999',
        location: 'Chennai, Tamil Nadu, India',
        companySize: '500,000+ employees',
        verificationStatus: 'Example Record',
        isExample: true,
        notes: 'Example Company Record — Verify details on the official company website.'
      },
      {
        name: 'Infosys Limited',
        logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
        about: 'Infosys is a global leader in next-generation digital services and consulting.',
        description: 'Enabling clients in more than 50 countries to navigate their digital transformation. Note: Illustrative simulated company profile.',
        industry: 'Digital Services & Consulting',
        website: 'https://www.infosys.com',
        email: 'careers-info@infosys.example.com',
        phone: '+91 80 2852 0261',
        location: 'Bengaluru / Chennai, India',
        companySize: '300,000+ employees',
        verificationStatus: 'Example Record',
        isExample: true,
        notes: 'Example Company Record — Verify details on the official company website.'
      },
      {
        name: 'Zoho Corporation',
        logo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80',
        about: 'Zoho offers beautifully smart software to help you grow your business.',
        description: 'With 55+ software products in nearly every major business category, including sales, marketing, and collaboration.',
        industry: 'Enterprise Software & SaaS',
        website: 'https://www.zoho.com',
        email: 'careers-info@zoho.example.com',
        phone: '+91 44 6744 7070',
        location: 'Chennai / Tenkasi, Tamil Nadu, India',
        companySize: '15,000+ employees',
        verificationStatus: 'Example Record',
        isExample: true,
        notes: 'Example Company Record — Verify details on the official company website.'
      }
    ];

    // Ensure the example companies exist without removing administrator-created records.
    const companyDocs = {};
    for (const comp of companiesData) {
      const doc = await Company.findOneAndUpdate(
        { name: comp.name },
        comp,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      companyDocs[comp.name] = doc;
    }
    console.log(`[BOOT] ✅ ${companiesData.length} demo companies ensured`);

    // 8. Ensure Verified Opportunities linked to canonical companies
    const internshipsData = [
      {
        title: 'Full Stack Web Developer Intern',
        company: 'Tata Consultancy Services',
        companyId: companyDocs['Tata Consultancy Services']?._id,
        companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
        companyWebsite: 'https://www.tcs.com',
        companyEmail: 'internships-sample@tcs.example.com',
        companyContact: '+91 22 6778 9999',
        applicationMethod: 'Platform Application',
        description: 'Design and implement responsive web interfaces and microservices. Collaborate with engineering mentors on real-world software components.',
        location: 'Chennai, Tamil Nadu',
        workMode: 'Hybrid',
        duration: '3 Months',
        skills: ['JavaScript', 'Node.js', 'Express', 'MongoDB', 'React'],
        stipend: '₹15,000 / month',
        fee: 0,
        type: 'Free',
        eligibility: 'Pre-final and Final year B.E / B.Tech / M.C.A students with minimum 65% aggregate',
        isVerified: true,
        verificationDate: new Date(),
        source: 'EDUTECH Career Services Verified',
        responsibilities: [
          'Develop modular RESTful APIs and backend services using Node.js & Express',
          'Collaborate with UI/UX engineers to create accessible and responsive frontend interfaces',
          'Participate in agile sprint ceremonies, code reviews, and automated testing'
        ],
        requirements: [
          'Proficiency in JavaScript (ES6+), HTML5, and CSS3',
          'Hands-on experience with MongoDB or relational databases',
          'Basic understanding of version control with Git'
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        category: 'Web Development',
        xpReward: 150,
        isExample: false,
        disclaimer: 'Notice: This opportunity is verified by EDUTECH NEXUS administration. Follow official application guidelines.',
        status: 'active'
      },
      {
        title: 'AI & Data Science Intern',
        company: 'Infosys Limited',
        companyId: companyDocs['Infosys Limited']?._id,
        companyLogo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
        companyWebsite: 'https://www.infosys.com',
        companyEmail: 'internships-sample@infosys.example.com',
        companyContact: '+91 80 2852 0261',
        applicationMethod: 'Platform Application',
        description: 'Work with applied machine learning models, statistical datasets, and cloud analytics pipelines under senior data engineering leads.',
        location: 'Bengaluru / Remote',
        workMode: 'Remote',
        duration: '6 Months',
        skills: ['Python', 'Pandas', 'TensorFlow', 'Machine Learning', 'SQL'],
        stipend: '₹18,000 / month',
        fee: 0,
        type: 'Free',
        eligibility: '2nd, 3rd, and 4th year undergraduate and postgraduate students in CS/IT/Data Science',
        isVerified: true,
        verificationDate: new Date(),
        source: 'EDUTECH Career Services Verified',
        responsibilities: [
          'Preprocess, clean, and analyze enterprise tabular and textual datasets',
          'Train, evaluate, and fine-tune supervised machine learning and NLP models',
          'Build automated data pipeline transformations and interactive performance dashboards'
        ],
        requirements: [
          'Strong Python programming and data structure fundamentals',
          'Experience with Pandas, NumPy, Scikit-Learn, or TensorFlow/PyTorch',
          'Solid understanding of statistics and SQL querying'
        ],
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days
        category: 'Artificial Intelligence',
        xpReward: 180,
        isExample: false,
        disclaimer: 'Notice: This opportunity is verified by EDUTECH NEXUS administration. Follow official application guidelines.',
        status: 'active'
      },
      {
        title: 'Cloud & Systems Software Intern',
        company: 'Zoho Corporation',
        companyId: companyDocs['Zoho Corporation']?._id,
        companyLogo: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80',
        companyWebsite: 'https://www.zoho.com',
        companyEmail: 'internships-sample@zoho.example.com',
        companyContact: '+91 44 6744 7070',
        applicationMethod: 'Platform Application',
        description: 'Build backend services, evaluate API scalability, and contribute to enterprise SaaS infrastructure tools.',
        location: 'Chennai / Tenkasi',
        workMode: 'On-site',
        duration: '4 Months',
        skills: ['Java', 'Python', 'Linux', 'Distributed Systems', 'MySQL'],
        stipend: '₹20,000 / month',
        fee: 0,
        type: 'Free',
        eligibility: 'Passionate coders with strong foundational understanding of algorithms and OS concepts',
        isVerified: true,
        verificationDate: new Date(),
        source: 'EDUTECH Career Services Verified',
        responsibilities: [
          'Design resilient microservices handling high concurrent throughput',
          'Optimize database queries, indexing strategies, and caching mechanisms',
          'Contribute to internal cloud tooling and system observability monitors'
        ],
        requirements: [
          'Proficiency in Java, Python, or C++',
          'Strong grasp of Linux CLI and process management',
          'Understanding of networking (TCP/IP, HTTP) and relational database design'
        ],
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        category: 'Cloud Engineering',
        xpReward: 200,
        isExample: false,
        disclaimer: 'Notice: This opportunity is verified by EDUTECH NEXUS administration. Follow official application guidelines.',
        status: 'active'
      }
    ];

    for (const intern of internshipsData) {
      await Internship.findOneAndUpdate(
        { title: intern.title, company: intern.company },
        intern,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    console.log(`[BOOT] ✅ ${internshipsData.length} default career opportunities ensured`);

    const repairedInternshipTitles = await repairRepeatedCloudInternshipTitles();
    if (repairedInternshipTitles) {
      console.log(`[BOOT] ✅ Corrected ${repairedInternshipTitles} repeated cloud internship titles`);
    }

    const repairedEventTitles = await repairRepeatedTechnicalEventTitles();
    if (repairedEventTitles) {
      console.log(`[BOOT] ✅ Corrected ${repairedEventTitles} repeated technical event titles`);
    }

    // 9. Ensure Company Profile PDF / Documents
    const CompanyDocument = require('../models/CompanyDocument');
    for (const [compName, cDoc] of Object.entries(companyDocs)) {
      const samplePdfUrl = `/documents/company_profile_${compName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
      await Company.findByIdAndUpdate(cDoc._id, { profilePdfUrl: samplePdfUrl });
      await CompanyDocument.findOneAndUpdate(
        { companyId: cDoc._id, documentType: 'Company Profile PDF' },
        {
          companyId: cDoc._id,
          title: `${compName} Official Corporate Profile`,
          documentType: 'Company Profile PDF',
          fileUrl: samplePdfUrl,
          fileName: `${compName.replace(/\s+/g, '_')}_Profile.pdf`,
          mimeType: 'application/pdf',
          status: 'active',
          description: `Comprehensive company overview and graduate recruitment guidelines for ${compName}.`
        },
        { upsert: true, new: true }
      );
    }
    console.log(`[BOOT] ✅ Company profile documents synchronized`);

    // 10. Module 3: NEXUS PLAYZONE — Initialize all 7 educational games + 2 legacy tech challenges
    const Game = require('../models/Game');
    const GameQuestion = require('../models/GameQuestion');
    const gamesSeed = require('../seed/gamesData');

    for (const gData of gamesSeed) {
      const { questions, levels, ...gameAttrs } = gData;
      const gameDoc = await Game.findOneAndUpdate(
        { title: gameAttrs.title },
        { $setOnInsert: gameAttrs },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      if (Array.isArray(questions)) {
        for (const q of questions) {
          const questionData = {
            gameId: gameDoc._id,
            gameType: gameDoc.gameType || 'quiz',
            category: q.category || gameDoc.category,
            level: q.level || 1,
            question: q.question,
            codeSnippet: q.codeSnippet || '',
            starterCode: q.starterCode || '',
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            expectedAnswer: q.expectedAnswer || '',
            hints: q.hints || [],
            explanation: q.explanation || '',
            sqlScenario: q.sqlScenario || null,
            xp: q.xp || 15,
            difficulty: q.difficulty || gameDoc.difficulty || 'Intermediate',
            isActive: true
          };
          await GameQuestion.updateOne(
            {
              gameId: questionData.gameId,
              gameType: questionData.gameType,
              level: questionData.level,
              question: questionData.question
            },
            { $setOnInsert: questionData },
            { upsert: true }
          );
        }
      }

      if (Array.isArray(levels)) {
        for (const lvl of levels) {
          const questionData = {
            gameId: gameDoc._id,
            gameType: 'debugging',
            category: lvl.category || 'Software Engineering',
            level: lvl.level,
            question: lvl.question,
            codeSnippet: lvl.codeSnippet,
            options: [lvl.buggyToken],
            correctAnswer: lvl.correctAnswer,
            expectedAnswer: lvl.expectedAnswer,
            explanation: lvl.explanation,
            xp: lvl.xp || 20,
            difficulty: lvl.difficulty || 'Intermediate',
            isActive: true
          };
          await GameQuestion.updateOne(
            {
              gameId: questionData.gameId,
              gameType: questionData.gameType,
              level: questionData.level,
              question: questionData.question
            },
            { $setOnInsert: questionData },
            { upsert: true }
          );
        }
      }
    }
    console.log(`[BOOT] ✅ NEXUS PLAYZONE: Initialized ${gamesSeed.length} educational games with full questions suites`);

  } catch (err) {
    console.error('[BOOT] ❌ Error ensuring default accounts and data:', err.message);
    throw err;
  }
}

module.exports = { ensureDefaultAccounts };
