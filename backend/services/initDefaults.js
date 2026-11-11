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

    // 6. Ensure exactly 5 core courses with 10 lessons each and quizzes
    const exact5Courses = require('../seed/coursesData');
    const Quiz = require('../models/Quiz');
    const SystemConfig = require('../models/SystemConfig');

    // Ensure Certificate Configuration
    await SystemConfig.findOneAndUpdate(
      { key: 'certificate_config' },
      {
        key: 'certificate_config',
        organizationName: 'EDUTECH NEXUS',
        adminName: 'Course Administrator',
        adminDesignation: 'Course Administrator',
        adminSignature: 'Course Administrator',
        certificateHeading: 'CERTIFICATE OF COMPLETION',
        mainHeading: 'THIS CERTIFICATE IS PROUDLY PRESENTED TO',
        certificateDescription: 'This certificate is awarded in recognition of successfully completing the course and fulfilling all learning requirements.'
      },
      { upsert: true }
    );

    if (Array.isArray(exact5Courses)) {
      for (const c of exact5Courses) {
        // Find existing course by title, slug, or legacy variations
        const legacyQueries = [{ title: c.title }, { slug: c.slug }];
        if (c.title === 'Artificial Intelligence (AI)') {
          legacyQueries.push({ title: 'AI Fundamentals' }, { slug: 'ai-fundamentals' });
        }
        if (c.title === 'Machine Learning (ML)') {
          legacyQueries.push({ title: 'AI & Machine Learning' }, { slug: 'ai-and-machine-learning' });
        }

        const existing = await Course.findOne({ $or: legacyQueries });
        let savedCourse;
        if (existing) {
          existing.title = c.title;
          existing.slug = c.slug;
          existing.category = c.category;
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

          const currentLessons = (existing.lessons || []).map(lesson => lesson.toObject ? lesson.toObject() : lesson);
          existing.lessons = c.lessons.map((lesson, index) => {
            const lessonNumber = lesson.lessonNumber || index + 1;
            const currentLesson = currentLessons.find(
              current => Number(current.lessonNumber || current.order) === Number(lessonNumber)
            );
            if (!currentLesson) return lesson;

            // Preserve admin customized videoUrl if updated, while ensuring defaultVideo is present
            const isCustomVideo = currentLesson.videoUrl && !currentLesson.videoUrl.includes('sample-lesson.mp4') && currentLesson.videoUrl !== lesson.videoUrl;

            return {
              ...lesson,
              ...currentLesson,
              _id: currentLesson._id,
              title: lesson.title, // Use current accurate lesson structure
              lessonNumber,
              order: lessonNumber,
              videoUrl: isCustomVideo ? currentLesson.videoUrl : lesson.videoUrl,
              youtubeVideoId: isCustomVideo ? (currentLesson.youtubeVideoId || '') : lesson.youtubeVideoId,
              defaultVideo: lesson.defaultVideo || '/videos/sample-lesson.mp4'
            };
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
              title: c.quiz.title || `${c.title} Certification Quiz`,
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
      console.log(`[BOOT] ✅ ${exact5Courses.length} core courses synchronized with 10 lessons each`);
    }

    const removedSampleMappings = await removeSampleVideoMappings();
    if (removedSampleMappings) {
      console.log(`[BOOT] Removed ${removedSampleMappings} incorrect sample video mappings.`);
    }

    // 7. Ensure Initial 3 Companies (TCS, OYO, Wipro - Maximum 5)
    const companiesData = [
      {
        name: 'Tata Consultancy Services (TCS)',
        logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
        about: 'Global leader in IT services, consulting, and business solutions powering global enterprises.',
        description: 'Tata Consultancy Services is an IT services, consulting, and business solutions organization that has been partnering with many of the world’s largest businesses for the past 50 years. A part of the Tata group, India\'s largest multinational business group, TCS has over 600,000 of the world’s best-trained consultants across 55 countries.',
        industry: 'Information Technology & Cloud Services',
        website: 'https://www.tcs.com',
        email: 'campus.recruitment@tcs.com',
        phone: '+91 22 6778 9999',
        location: 'Chennai / Mumbai / Global',
        companySize: '600,000+ employees',
        availableDomains: ['Cloud Architecture', 'Full Stack Development', 'AI & Machine Learning', 'Cybersecurity', 'Data Engineering'],
        requiredSkills: ['Java', 'Python', 'React', 'Node.js', 'SQL', 'Cloud Fundamentals'],
        eligibility: 'B.E / B.Tech / M.C.A / M.Tech in CS/IT/ECE with minimum 60% aggregate and no active backlogs.',
        internshipDuration: '3 to 6 Months',
        applicationProcedure: '1. Online Application via EDUTECH NEXUS. 2. Cognitive & Technical Assessment. 3. Technical Interview with Enterprise Domain Architect. 4. HR Interview & Offer Dispatch.',
        verificationStatus: 'Verified',
        isExample: false,
        notes: 'Official enterprise partner record.'
      },
      {
        name: 'OYO',
        logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
        about: 'Global hospitality technology platform empowering entrepreneurs and small businesses.',
        description: 'OYO is a leading global technology platform that empowers entrepreneurs and small businesses with hotels and homes by providing full-stack technology products and revenue-generation tools that increase revenue and ease operations. OYO operates a distributed real-time inventory management, booking engine, dynamic pricing, and automated hospitality management system.',
        industry: 'Hospitality Tech & Consumer Software',
        website: 'https://www.oyorooms.com',
        email: 'careers@oyorooms.com',
        phone: '+91 124 6201611',
        location: 'Gurugram / Bangalore / Remote',
        companySize: '10,000+ employees',
        availableDomains: ['Frontend Engineering', 'Backend Services', 'Mobile App Development', 'Product Analytics', 'Data Science'],
        requiredSkills: ['JavaScript', 'React Native', 'Node.js', 'Go', 'Python', 'MongoDB', 'Redis'],
        eligibility: 'Pre-final & Final year undergraduate/postgraduate students with strong problem solving and programming fundamentals.',
        internshipDuration: '3 to 6 Months',
        applicationProcedure: '1. Profile Screening. 2. Online Algorithmic Coding Challenge (2 Problems). 3. System Design & Frontend/Backend Deep-Dive. 4. Culture Fit & HR Round.',
        verificationStatus: 'Verified',
        isExample: false,
        notes: 'High-growth consumer tech platform.'
      },
      {
        name: 'Wipro',
        logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
        about: 'Leading technology services and consulting company focused on building innovative solutions.',
        description: 'Wipro Limited is a leading technology services and consulting company focused on building innovative solutions that address clients’ most complex digital transformation needs. Leveraging our holistic portfolio of capabilities in consulting, design, engineering, and operations, we help clients realize their boldest ambitions and build future-ready, sustainable businesses.',
        industry: 'Digital Transformation & Enterprise IT',
        website: 'https://www.wipro.com',
        email: 'campus.helpdesk@wipro.com',
        phone: '+91 80 2844 0011',
        location: 'Bengaluru / Hyderabad / Chennai',
        companySize: '250,000+ employees',
        availableDomains: ['Full Stack Development', 'Artificial Intelligence', 'DevOps & Cloud', 'Embedded Systems', 'Business Analytics'],
        requiredSkills: ['Python', 'Java', 'Spring Boot', 'React', 'SQL', 'Docker', 'REST APIs'],
        eligibility: 'Engineering graduates (CSE, IT, ECE, EEE) with minimum 65% in 10th, 12th, and Degree.',
        internshipDuration: '6 Months',
        applicationProcedure: '1. Direct Platform Application. 2. Wipro Elite National Talent Assessment. 3. Coding & Technical Interview. 4. Final HR Discussion.',
        verificationStatus: 'Verified',
        isExample: false,
        notes: 'Global technology consulting partner.'
      }
    ];

    // Ensure initial 3 companies exist
    const companyDocs = {};
    for (const comp of companiesData) {
      const doc = await Company.findOneAndUpdate(
        { name: comp.name },
        comp,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      companyDocs[comp.name] = doc;
    }
    console.log(`[BOOT] ✅ ${companiesData.length} core companies ensured (TCS, OYO, Wipro)`);

    // 8. Ensure Verified Opportunities linked to canonical companies
    const internshipsData = [
      {
        title: 'Graduate Software Engineer Intern',
        company: 'Tata Consultancy Services (TCS)',
        companyId: companyDocs['Tata Consultancy Services (TCS)']?._id,
        companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
        companyWebsite: 'https://www.tcs.com',
        companyEmail: 'campus.recruitment@tcs.com',
        companyContact: '+91 22 6778 9999',
        applicationMethod: 'Platform Application',
        description: 'Work with cloud architecture teams developing microservices, distributed caching, and backend data pipelines for enterprise platforms.',
        location: 'Chennai / Hyderabad / Hybrid',
        workMode: 'Hybrid',
        duration: '3 to 6 Months',
        skills: ['Java', 'Spring Boot', 'SQL', 'REST APIs', 'Cloud Fundamentals'],
        stipend: '₹22,000 / month',
        fee: 0,
        type: 'Free',
        eligibility: 'B.E / B.Tech / M.C.A in CSE, IT, ECE with minimum 60% aggregate.',
        category: 'Software Engineering',
        xpReward: 150,
        isVerified: true,
        verificationDate: new Date(),
        source: 'EDUTECH Career Services Verified',
        responsibilities: [
          'Develop modular RESTful APIs and backend services using Java and Spring Boot',
          'Optimize database queries and integrate microservices with enterprise message queues',
          'Participate in agile sprint ceremonies, code reviews, and automated CI/CD pipeline builds'
        ],
        requirements: [
          'Strong core Java and OOP principles understanding',
          'Hands-on experience with SQL databases and relational modeling',
          'Basic understanding of version control with Git and REST architecture'
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        title: 'Full Stack Product Engineering Intern',
        company: 'OYO',
        companyId: companyDocs['OYO']?._id,
        companyLogo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80',
        companyWebsite: 'https://www.oyorooms.com',
        companyEmail: 'careers@oyorooms.com',
        companyContact: '+91 124 6201611',
        applicationMethod: 'Platform Application',
        description: 'Build high-performance real-time consumer web applications, booking engine interfaces, and microservices powering millions of global stays.',
        location: 'Gurugram / Bangalore / Remote',
        workMode: 'Remote',
        duration: '3 to 6 Months',
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Redis'],
        stipend: '₹25,000 / month',
        fee: 0,
        type: 'Free',
        eligibility: 'Pre-final & Final year undergraduate/postgraduate engineering students with web project portfolio.',
        category: 'Web Development',
        xpReward: 180,
        isVerified: true,
        verificationDate: new Date(),
        source: 'EDUTECH Career Services Verified',
        responsibilities: [
          'Build customer-facing responsive web components with modern React and CSS architectures',
          'Collaborate with product managers and UX designers on high-impact booking funnel experiences',
          'Write unit tests and optimize page load speeds for high-traffic mobile web browsers'
        ],
        requirements: [
          'Proficiency in modern JavaScript (ES6+), React, and Node.js',
          'Familiarity with state management, REST APIs, and asynchronous workflows',
          'Passion for building high-scale consumer internet applications'
        ],
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        status: 'active'
      },
      {
        title: 'Enterprise Digital Transformation Intern',
        company: 'Wipro',
        companyId: companyDocs['Wipro']?._id,
        companyLogo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80',
        companyWebsite: 'https://www.wipro.com',
        companyEmail: 'campus.helpdesk@wipro.com',
        companyContact: '+91 80 2844 0011',
        applicationMethod: 'Platform Application',
        description: 'Design and optimize core cloud modules, automated test harnesses, and client integration microservices across global enterprise accounts.',
        location: 'Bengaluru / Chennai / Hybrid',
        workMode: 'Hybrid',
        duration: '6 Months',
        skills: ['Python', 'Java', 'Docker', 'SQL', 'REST APIs'],
        stipend: '₹20,000 / month',
        fee: 0,
        type: 'Free',
        eligibility: 'Engineering graduates (CSE, IT, ECE) with minimum 65% aggregate.',
        category: 'Cloud & Software',
        xpReward: 160,
        isVerified: true,
        verificationDate: new Date(),
        source: 'EDUTECH Career Services Verified',
        responsibilities: [
          'Assist senior architects in building scalable business services and cloud microservices',
          'Develop automated integration test suites and technical API documentation',
          'Contribute to client digital transformation deliverables using agile methodologies'
        ],
        requirements: [
          'Strong proficiency in Python or Java fundamentals and data structures',
          'Basic understanding of containerization (Docker) and cloud computing concepts',
          'Excellent analytical, problem-solving, and collaborative communication skills'
        ],
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
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
