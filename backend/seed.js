require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDatabase = require('./config/db');

// Models
const User = require('./models/User');
const Course = require('./models/Course');
const CourseRegistration = require('./models/CourseRegistration');
const Certificate = require('./models/Certificate');
const Internship = require('./models/Internship');
const InternshipRegistration = require('./models/InternshipRegistration');
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const Game = require('./models/Game');
const GameResult = require('./models/GameResult');
const Discussion = require('./models/Discussion');
const Reply = require('./models/Reply');
const Club = require('./models/Club');
const Message = require('./models/Message');
const XPTransaction = require('./models/XPTransaction');
const XPConfig = require('./models/XPConfig');

const students = [
  {
    fullName: 'Demo Student',
    email: process.env.STUDENT_EMAIL || 'student@edutechnexus.com',
    username: 'student',
    registerNumber: 'EDU-DEMO-001',
    studentId: 'EDU-DEMO-001',
    department: 'Computer Science & Engineering',
    college: 'EDUTECH Institute of Technology',
    year: '3',
    phone: '9876543200',
    state: 'Tamil Nadu',
    city: 'Chennai',
    skills: ['JavaScript', 'Python', 'React', 'Node.js'],
    bio: 'Tech enthusiast and active EDUTECH NEXUS member.',
    xp: 500,
    level: 3
  },
  {
    fullName: 'Sudeshkumar M',
    email: 'sudeshkumar@edutechnexus.com',
    username: 'sudesh',
    registerNumber: 'EDU-STU-001',
    studentId: 'EDU-STU-001',
    department: 'Artificial Intelligence & Data Science',
    college: 'PSG College of Technology',
    year: '3',
    phone: '9876543210',
    state: 'Tamil Nadu',
    city: 'Coimbatore',
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'React'],
    bio: 'AI researcher and competitive programmer passionate about neural systems.',
    xp: 680,
    level: 3
  },
  {
    fullName: 'Karthi R',
    email: 'karthi@edutechnexus.com',
    username: 'karthi_dev',
    registerNumber: 'EDU-STU-002',
    studentId: 'EDU-STU-002',
    department: 'Computer Science & Engineering',
    college: 'Madras Institute of Technology',
    year: '3',
    phone: '9876543211',
    state: 'Tamil Nadu',
    city: 'Chennai',
    skills: ['JavaScript', 'Node.js', 'Express.js', 'MongoDB', 'Docker'],
    bio: 'Full stack developer building distributed web applications.',
    xp: 520,
    level: 3
  },
  {
    fullName: 'Sugumar P',
    email: 'sugumar@edutechnexus.com',
    username: 'sugumar_tech',
    registerNumber: 'EDU-STU-003',
    studentId: 'EDU-STU-003',
    department: 'Information Technology',
    college: 'Thiagarajar College of Engineering',
    year: '2',
    phone: '9876543212',
    state: 'Tamil Nadu',
    city: 'Madurai',
    skills: ['Python', 'Django', 'PostgreSQL', 'Data Structures'],
    bio: 'Software enthusiast focused on backend scalability and algorithms.',
    xp: 440,
    level: 2
  },
  {
    fullName: 'Nithin V',
    email: 'nithin@edutechnexus.com',
    username: 'nithin_code',
    registerNumber: 'EDU-STU-004',
    studentId: 'EDU-STU-004',
    department: 'Computer Science & Engineering',
    college: 'Coimbatore Institute of Technology',
    year: '2',
    phone: '9876543213',
    state: 'Tamil Nadu',
    city: 'Coimbatore',
    skills: ['Java', 'Spring Boot', 'SQL', 'Cybersecurity'],
    bio: 'Aspiring systems engineer and competitive coding enthusiast.',
    xp: 310,
    level: 2
  },
  {
    fullName: 'Divya S',
    email: 'divya@edutechnexus.com',
    username: 'divya_ai',
    registerNumber: 'EDU-STU-005',
    studentId: 'EDU-STU-005',
    department: 'Data Science & Analytics',
    college: 'Government College of Technology',
    year: '3',
    phone: '9876543214',
    state: 'Tamil Nadu',
    city: 'Coimbatore',
    skills: ['Python', 'Pandas', 'PowerBI', 'Deep Learning'],
    bio: 'Data science practitioner transforming raw metrics into impactful insights.',
    xp: 220,
    level: 1
  }
];

async function seed(options = {}) {
  console.log('🌱 Starting EDUTECH NEXUS Database Seeding...');
  if (mongoose.connection.readyState !== 1) {
    await connectDatabase();
  }

  // 1. Setup Default XP Config
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
    { upsert: true, new: true }
  );
  console.log('✅ XP Configuration initialized');

  // 2. Setup Admin Account
  const adminEmail = process.env.ADMIN_EMAIL || 'adminedutech001@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@edutech';
  const adminHash = await bcrypt.hash(adminPassword, 12);

  const admin = await User.findOneAndUpdate(
    { email: adminEmail },
    {
      fullName: 'System Administrator',
      email: adminEmail,
      username: 'admin',
      password: adminHash,
      phone: '9000000000',
      registerNumber: 'ADMIN-001',
      studentId: 'ADMIN-001',
      college: 'EDUTECH NEXUS HQ',
      department: 'Platform Operations',
      role: 'admin',
      isActive: true,
      xp: 9999,
      level: 10
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`✅ Admin account ready: ${admin.email} (password configured via ADMIN_PASSWORD)`);

  // 3. Setup 5 Student Users
  const studentDocs = [];
  const defaultStudentPasswordHash = await bcrypt.hash('Student@123', 12);

  for (const s of students) {
    const doc = await User.findOneAndUpdate(
      { email: s.email },
      {
        ...s,
        password: defaultStudentPasswordHash,
        role: 'student',
        isActive: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    studentDocs.push(doc);

    // Initial XP Transaction for realistic dashboard activity
    await XPTransaction.findOneAndUpdate(
      { studentId: doc._id, action: 'course_registration' },
      {
        studentId: doc._id,
        user: doc._id,
        action: 'course_registration',
        xp: s.xp,
        amount: s.xp,
        description: 'Initial student onboarding and milestone achievements',
        date: new Date(Date.now() - Math.floor(Math.random() * 5 * 86400000))
      },
      { upsert: true }
    );
  }
  console.log(`✅ ${studentDocs.length} student accounts initialized`);

  // 4. Initial 3 Primary Courses with 7 Lessons Each (Section 8 & 10)
  const coursesData = [
    {
      title: 'AI & Machine Learning',
      category: 'Artificial Intelligence',
      description: 'Master practical machine learning algorithms, deep learning neural networks, and computer vision with Python and modern ML tools.',
      instructor: 'Dr. A. Ramanathan (AI Research Lead)',
      duration: '8 weeks',
      difficulty: 'Intermediate',
      level: 'Intermediate',
      xpReward: 120,
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
      image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
      lessons: [
        {
          order: 1,
          title: 'Lesson 1 - Introduction to AI',
          description: 'Understanding artificial intelligence paradigms, historical context, and modern applications.',
          content: '### Welcome to Artificial Intelligence\n\nArtificial Intelligence (AI) simulates human intelligence processes through algorithmic systems. Modern AI encompasses machine learning, deep learning, NLP, and computer vision.',
          videoUrl: 'https://www.youtube.com/embed/JMUxmLyrhSk',
          duration: '20 mins'
        },
        {
          order: 2,
          title: 'Lesson 2 - Machine Learning Basics',
          description: 'Supervised vs unsupervised learning, features, target labels, and dataset splitting.',
          content: '### Core Machine Learning Concepts\n\nIn machine learning, algorithms discover patterns from data rather than relying strictly on hard-coded rules. Key components include feature vectors, loss functions, and optimization.',
          videoUrl: 'https://www.youtube.com/embed/ukzFI9rgwfU',
          duration: '25 mins'
        },
        {
          order: 3,
          title: 'Lesson 3 - Data Preprocessing',
          description: 'Handling missing values, standard scaling, one-hot encoding, and feature normalization.',
          content: '### Preparing Clean Data for ML Models\n\nReal-world data is noisy and incomplete. Using Pandas and Scikit-Learn, we handle imputations, scale numeric values with StandardScaler, and encode categoricals.',
          videoUrl: 'https://www.youtube.com/embed/0LTXpeRC3_8',
          duration: '30 mins'
        },
        {
          order: 4,
          title: 'Lesson 4 - Regression',
          description: 'Linear regression, multiple regression, cost functions (MSE), and gradient descent.',
          content: '### Predicting Continuous Values with Regression\n\nLinear regression models relationship between independent features X and dependent target y using linear equations: y = mx + c.',
          videoUrl: 'https://www.youtube.com/embed/E5RjzSK0fvY',
          duration: '30 mins'
        },
        {
          order: 5,
          title: 'Lesson 5 - Classification',
          description: 'Logistic regression, decision trees, support vector machines, and random forests.',
          content: '### Discrete Target Categorization\n\nClassification determines which category a given input belongs to. Learn decision boundary concepts and probability thresholds using Sigmoid activation.',
          videoUrl: 'https://www.youtube.com/embed/yIYKR4sgzI8',
          duration: '35 mins'
        },
        {
          order: 6,
          title: 'Lesson 6 - Neural Networks',
          description: 'Perceptrons, multi-layer architectures, forward propagation, and backpropagation.',
          content: '### Deep Learning & Multi-layer Perceptrons\n\nDeep neural networks layer multiple artificial neurons using non-linear activation functions (ReLU, Sigmoid) to model complex high-dimensional relationships.',
          videoUrl: 'https://www.youtube.com/embed/aircAruvnKk',
          duration: '40 mins'
        },
        {
          order: 7,
          title: 'Lesson 7 - Model Evaluation',
          description: 'Confusion matrices, precision, recall, F1-score, ROC-AUC, and cross-validation.',
          content: '### Rigorous Model Validation\n\nEvaluate your trained models beyond simple accuracy. Understand trade-offs between false positives and false negatives to deploy production-safe AI models.',
          videoUrl: 'https://www.youtube.com/embed/wpNrmS_2w0I',
          duration: '25 mins'
        }
      ]
    },
    {
      title: 'Full Stack Development',
      category: 'Web Development',
      description: 'Build complete production web applications from database architecture to modern frontend interfaces and secure REST APIs.',
      instructor: 'K. Sundaram (Senior Principal Architect)',
      duration: '10 weeks',
      difficulty: 'Intermediate',
      level: 'Intermediate',
      xpReward: 150,
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
      lessons: [
        {
          order: 1,
          title: 'Lesson 1 - HTML',
          description: 'Semantic HTML5 structure, accessibility best practices, and document hierarchy.',
          content: '### Semantic Web Architecture\n\nLearn modern HTML5 semantic elements (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`) for robust search indexing and accessibility.',
          videoUrl: 'https://www.youtube.com/embed/kUMe1FH4CHE',
          duration: '20 mins'
        },
        {
          order: 2,
          title: 'Lesson 2 - CSS',
          description: 'Modern CSS3, Flexbox, Grid, CSS variables, glassmorphism, and responsive layouts.',
          content: '### Styling & Responsive Design\n\nMaster CSS Flexbox and 2D Grid layouts to construct clean responsive designs that adapt seamlessly from mobile devices to desktop monitors.',
          videoUrl: 'https://www.youtube.com/embed/1Rs2ND1ryYc',
          duration: '30 mins'
        },
        {
          order: 3,
          title: 'Lesson 3 - JavaScript',
          description: 'Modern ES6+ syntax, asynchronous promises, async/await, and DOM manipulation.',
          content: '### Interactive Logic with ES6+\n\nDeep dive into closures, array higher-order methods, asynchronous promises, fetch API, and browser event listeners.',
          videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
          duration: '35 mins'
        },
        {
          order: 4,
          title: 'Lesson 4 - Node.js',
          description: 'Node.js runtime, event loop, non-blocking I/O, and npm ecosystem.',
          content: '### Server-side JavaScript Engine\n\nExplore how Node.js runs JavaScript on the V8 engine, managing concurrency through the event loop and asynchronous callbacks.',
          videoUrl: 'https://www.youtube.com/embed/TlB_eWDSMt4',
          duration: '25 mins'
        },
        {
          order: 5,
          title: 'Lesson 5 - Express.js',
          description: 'Express routing, middleware architecture, request handling, and error pipelines.',
          content: '### Building Resilient Web Servers\n\nImplement modular routing, authentication middleware, error handling cascades, and CORS configuration in Express.',
          videoUrl: 'https://www.youtube.com/embed/L72fhGm1tfE',
          duration: '30 mins'
        },
        {
          order: 6,
          title: 'Lesson 6 - MongoDB',
          description: 'NoSQL document schemas, Mongoose modeling, indexing, and aggregations.',
          content: '### Scalable NoSQL Data Persistence\n\nDesign document schemas with Mongoose, configure schema validations, create index definitions, and write aggregation pipelines.',
          videoUrl: 'https://www.youtube.com/embed/ofme2o29ngU',
          duration: '35 mins'
        },
        {
          order: 7,
          title: 'Lesson 7 - REST API',
          description: 'RESTful API principles, JWT authentication, rate limiting, and API deployment.',
          content: '### Production RESTful API Architecture\n\nStructure production RESTful endpoints with status codes, payload validations, JWT session protection, and rate limits.',
          videoUrl: 'https://www.youtube.com/embed/fgTGADljAeg',
          duration: '40 mins'
        }
      ]
    },
    {
      title: 'Python Programming',
      category: 'Programming',
      description: 'Comprehensive Python foundation from basic syntax to object-oriented programming, data structures, and capstone software projects.',
      instructor: 'S. Meenakshi (Senior Python Consultant)',
      duration: '6 weeks',
      difficulty: 'Beginner',
      level: 'Beginner',
      xpReward: 100,
      thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
      image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
      lessons: [
        {
          order: 1,
          title: 'Lesson 1 - Python Basics',
          description: 'Python installation, IDE setup, syntax fundamentals, and execution model.',
          content: '### Getting Started with Python\n\nPython is an interpreted, high-level, dynamically typed language known for clarity and expressive syntax. Learn basic print, input, and comment structures.',
          videoUrl: 'https://www.youtube.com/embed/kqtD5dpn9C8',
          duration: '15 mins'
        },
        {
          order: 2,
          title: 'Lesson 2 - Variables',
          description: 'Data types, integers, floats, strings, booleans, and type casting.',
          content: '### Python Data Types & Memory References\n\nUnderstand dynamic typing, immutability of strings and tuples, and explicit type conversion.',
          videoUrl: 'https://www.youtube.com/embed/khKv-8q7YmY',
          duration: '20 mins'
        },
        {
          order: 3,
          title: 'Lesson 3 - Conditions',
          description: 'if, elif, else branches, logical operators, and comparison expressions.',
          content: '### Conditional Execution & Decision Control\n\nStructure programmatic branching logic with Python indentation, boolean operators (`and`, `or`, `not`), and ternary expressions.',
          videoUrl: 'https://www.youtube.com/embed/AWek49wXGzI',
          duration: '20 mins'
        },
        {
          order: 4,
          title: 'Lesson 4 - Loops',
          description: 'for loops, while loops, range generator, break, and continue statements.',
          content: '### Iteration & Collection Traversal\n\nIterate through sequences with `for` loops, utilize enumerate, zip, and implement while-loops with termination invariants.',
          videoUrl: 'https://www.youtube.com/embed/6iF8Xb7Z3wQ',
          duration: '25 mins'
        },
        {
          order: 5,
          title: 'Lesson 5 - Functions',
          description: 'Defining functions, parameters, return values, *args, **kwargs, and docstrings.',
          content: '### Modular & Reusable Code Blocks\n\nEncapsulate algorithmic logic into reusable functions, default arguments, keyword arguments, and lambda expressions.',
          videoUrl: 'https://www.youtube.com/embed/9Os0o3wzS_I',
          duration: '30 mins'
        },
        {
          order: 6,
          title: 'Lesson 6 - OOP',
          description: 'Classes, objects, __init__ constructor, inheritance, and encapsulation.',
          content: '### Object-Oriented Software Modeling\n\nModel real-world entities through classes, instance attributes, methods, inheritance hierarchies, and method overriding.',
          videoUrl: 'https://www.youtube.com/embed/JeznW_7DlB0',
          duration: '35 mins'
        },
        {
          order: 7,
          title: 'Lesson 7 - Projects',
          description: 'Building a complete command-line automation and data processing project.',
          content: '### Capstone Project: File Analytics Tool\n\nSynthesize your Python knowledge by constructing a modular utility that ingests CSV datasets, executes transformations, and outputs summaries.',
          videoUrl: 'https://www.youtube.com/embed/rfscVS0vtbw',
          duration: '40 mins'
        }
      ]
    }
  ];

  const createdCourses = [];
  for (const c of coursesData) {
    const course = await Course.findOneAndUpdate(
      { title: c.title },
      { ...c, status: 'active' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    createdCourses.push(course);
  }
  console.log(`✅ 3 primary courses with 7 lessons each initialized`);

  // 5. Enroll first student in Course 1 with 95% progress (Certificate Eligible & Claimed)
  // Enroll second student in Course 2 with 50% progress
  const firstStudent = studentDocs[0];
  const secondStudent = studentDocs[1];

  const enrollment1 = await CourseRegistration.findOneAndUpdate(
    { user: firstStudent._id, course: createdCourses[0]._id },
    {
      user: firstStudent._id,
      course: createdCourses[0]._id,
      registrationDate: new Date(Date.now() - 10 * 86400000),
      expiryDate: new Date(Date.now() + 20 * 86400000), // 30-day window
      progress: 100,
      completedLessons: ['1', '2', '3', '4', '5', '6', '7'],
      completed: true,
      certificateEligible: true,
      certificateClaimed: true
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Generate certificate for student 1
  const certId = 'EN-CERT-2026-AI9901';
  const certDoc = await Certificate.findOneAndUpdate(
    { certificateId: certId },
    {
      certificateId: certId,
      user: firstStudent._id,
      studentName: firstStudent.fullName,
      studentDepartment: firstStudent.department,
      studentCollege: firstStudent.college,
      course: createdCourses[0]._id,
      courseName: createdCourses[0].title,
      completionDate: new Date(),
      issueDate: new Date(),
      awardedXP: 150,
      status: 'active'
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  enrollment1.certificate = certDoc._id;
  await enrollment1.save();

  await CourseRegistration.findOneAndUpdate(
    { user: secondStudent._id, course: createdCourses[1]._id },
    {
      user: secondStudent._id,
      course: createdCourses[1]._id,
      registrationDate: new Date(),
      expiryDate: new Date(Date.now() + 30 * 86400000),
      progress: 43,
      completedLessons: ['1', '2', '3'],
      completed: false,
      certificateEligible: false
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('✅ Student enrollments and initial certificate generated');

  // 6. Initial 3 Internship Records (TCS, Infosys, Zoho - Section 13)
  const internshipsData = [
    {
      title: 'Graduate Software Engineer Intern',
      company: 'Tata Consultancy Services (TCS)',
      companyLogo: 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?auto=format&fit=crop&w=200&q=80',
      description: 'Work with cloud architecture teams developing microservices and backend data pipelines for enterprise platforms.',
      location: 'Chennai / Hyderabad',
      workMode: 'Hybrid',
      duration: '3 Months',
      skills: ['Java', 'Spring Boot', 'SQL', 'REST API'],
      stipend: '₹22,000 / month',
      fee: 0,
      type: 'Free',
      eligibility: 'B.E / B.Tech / M.C.A in CSE, IT, ECE with minimum 70% aggregate.',
      category: 'Software Engineering',
      xpReward: 150,
      isExample: true,
      disclaimer: 'Notice: This is an example company record for platform learning simulations. EDUTECH NEXUS does not claim an official partnership unless verified.',
      status: 'active'
    },
    {
      title: 'Full Stack Development Intern',
      company: 'Infosys',
      companyLogo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=200&q=80',
      description: 'Collaborate with frontend engineers and UX designers to build high-performance web applications using modern JavaScript frameworks.',
      location: 'Bangalore / Chennai',
      workMode: 'Remote',
      duration: '6 Months',
      skills: ['React', 'Node.js', 'Express', 'MongoDB'],
      stipend: '₹25,000 / month',
      fee: 0,
      type: 'Free',
      eligibility: 'Open to pre-final and final year engineering students with web development project portfolio.',
      category: 'Web Development',
      xpReward: 180,
      isExample: true,
      disclaimer: 'Notice: This is an example company record for platform learning simulations. EDUTECH NEXUS does not claim an official partnership unless verified.',
      status: 'active'
    },
    {
      title: 'Product Engineering Intern',
      company: 'Zoho Corporation',
      companyLogo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=200&q=80',
      description: 'Design and optimize core SaaS cloud modules, database queries, and frontend component libraries.',
      location: 'Tenkasi / Chennai',
      workMode: 'On-site',
      duration: '4 Months',
      skills: ['Python', 'C++', 'Data Structures', 'Linux'],
      stipend: '₹20,000 / month',
      fee: 0,
      type: 'Free',
      eligibility: 'Strong proficiency in core programming fundamentals, problem-solving, and operating systems.',
      category: 'Cloud SaaS',
      xpReward: 160,
      isExample: true,
      disclaimer: 'Notice: This is an example company record for platform learning simulations. EDUTECH NEXUS does not claim an official partnership unless verified.',
      status: 'active'
    }
  ];

  for (const i of internshipsData) {
    await Internship.findOneAndUpdate(
      { title: i.title, company: i.company },
      i,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log('✅ 3 example internship opportunities initialized (TCS, Infosys, Zoho)');

  // 7. Initial 3 Technical Events (Section 15)
  const eventsData = [
    {
      title: 'NEXUS Statewide College Hackathon 2026',
      description: 'A 36-hour continuous build hackathon addressing real-world problem statements in FinTech, EdTech, and AI automation.',
      organizer: 'EDUTECH NEXUS Student Network',
      category: 'Hackathons',
      date: new Date(Date.now() + 14 * 86400000),
      time: '09:00 AM - 06:00 PM',
      venue: 'PSG Tech Campus / Virtual Discord',
      mode: 'Hybrid',
      registrationDeadline: new Date(Date.now() + 10 * 86400000),
      eligibility: 'Student teams of 2 to 4 members from any accredited technical institution.',
      eventImage: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      registrationLink: '',
      isExternal: false,
      xpReward: 50,
      maxParticipants: 150,
      participants: [firstStudent._id, secondStudent._id],
      status: 'active'
    },
    {
      title: 'Cloud Native & Docker Technical Workshop',
      description: 'Hands-on intensive workshop learning containerization, Kubernetes cluster orchestration, and CI/CD pipelines.',
      organizer: 'EDUTECH NEXUS Cloud Club',
      category: 'Workshops',
      date: new Date(Date.now() + 21 * 86400000),
      time: '10:00 AM - 01:00 PM',
      venue: 'Online Google Meet / Zoom',
      mode: 'Online',
      registrationDeadline: new Date(Date.now() + 18 * 86400000),
      eligibility: 'Open to all students curious about DevOps and modern cloud deployments.',
      eventImage: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80',
      registrationLink: '',
      isExternal: false,
      xpReward: 40,
      maxParticipants: 200,
      participants: [firstStudent._id],
      status: 'active'
    },
    {
      title: 'Smart India Hackathon (SIH) Style Regional Challenge',
      description: 'Preparation challenge modeled after national technology competitions with mentors evaluating problem solutions.',
      organizer: 'Regional Collegiate Alliance',
      category: 'Government/Industry Events',
      date: new Date(Date.now() + 28 * 86400000),
      time: '09:30 AM - 05:00 PM',
      venue: 'State Convention Centre / Official Portal',
      mode: 'Hybrid',
      registrationDeadline: new Date(Date.now() + 24 * 86400000),
      eligibility: 'Verified undergraduate student innovators.',
      eventImage: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
      registrationLink: 'https://sih.gov.in',
      isExternal: true,
      externalDisclaimer: 'External Event: SIH is an independent national initiative. EDUTECH NEXUS provides preparation guidance and simulation tracking only.',
      xpReward: 60,
      maxParticipants: 100,
      participants: [],
      status: 'active'
    }
  ];

  for (const e of eventsData) {
    await Event.findOneAndUpdate(
      { title: e.title },
      e,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log('✅ 3 technical events initialized with external event disclaimers');

  // 8. Initial 2 Tech Games (Section 16: Code Challenge & Debugging Challenge)
  const gamesData = [
    {
      title: 'Code Challenge: String Manipulation & Palindrome',
      description: 'Write a JavaScript function named `solution(str)` that reverses the given string, strips non-alphanumeric characters, and returns the cleaned reversed string.',
      category: 'Code Challenge',
      gameType: 'code-challenge',
      difficulty: 'Beginner',
      xpReward: 50,
      timeLimit: 600,
      starterCode: `function solution(str) {
  // Your code here
  // Return the reversed string with non-alphanumeric characters removed
  return str.replace(/[^a-zA-Z0-9]/g, '').split('').reverse().join('');
}`,
      testCases: [
        {
          input: JSON.stringify('radar'),
          expectedOutput: '"radar"',
          description: 'Simple palindrome word'
        },
        {
          input: JSON.stringify('hello world'),
          expectedOutput: '"dlrowolleh"',
          description: 'Reverses without spaces'
        },
        {
          input: JSON.stringify('A man, a plan!'),
          expectedOutput: '"nalpanamaA"',
          description: 'Punctuation stripped and reversed'
        }
      ],
      status: 'active'
    },
    {
      title: 'Debugging Challenge: Fix Array Deduplication',
      description: 'The given function is supposed to remove duplicate numbers from an array and return them in ascending order. However, it currently contains logic errors. Identify and fix the bug!',
      category: 'Debugging',
      gameType: 'debugging',
      difficulty: 'Intermediate',
      xpReward: 60,
      timeLimit: 600,
      bugCode: `function fixBug(arr) {
  // BUG: The code below incorrectly handles duplicates and sorting!
  let unique = [];
  for (let i = 0; i < arr.length; i++) {
    // Incorrect condition: should push if not already present
    if (unique.indexOf(arr[i]) === -1) {
      unique.push(arr[i]);
    }
  }
  // BUG: arr.sort() does lexicographical sort on numbers (e.g. 10 before 2)
  return unique.sort((a, b) => a - b);
}`,
      testCases: [
        {
          input: JSON.stringify([5, 2, 8, 2, 5, 10, 1]),
          expectedOutput: JSON.stringify([1, 2, 5, 8, 10]),
          description: 'Removes duplicates and sorts numerically'
        },
        {
          input: JSON.stringify([9, 9, 9, 9]),
          expectedOutput: JSON.stringify([9]),
          description: 'Collapses identical elements'
        }
      ],
      status: 'active'
    }
  ];

  for (const g of gamesData) {
    await Game.findOneAndUpdate(
      { title: g.title },
      g,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log('✅ 2 tech games initialized (Code Challenge & Debugging Challenge)');

  // 9. Example Discussions & Clubs (Section 18 & 19)
  const discussionsData = [
    {
      title: 'Roadmap for AI and Full Stack Development',
      content: 'What should students focus on first when combining deep learning pipelines with web application frontends? Should we prioritize FastAPI or Node.js for model inference servers?',
      category: 'Career & Guidance',
      author: firstStudent._id
    },
    {
      title: 'Best Practices for MongoDB Indexing in Production',
      content: 'Sharing tips on compound indexes, sparse indexes, and avoiding full collection scans in high-concurrency apps.',
      category: 'Web Development',
      author: secondStudent._id
    }
  ];

  for (const d of discussionsData) {
    const disc = await Discussion.findOneAndUpdate(
      { title: d.title },
      { ...d, likes: [secondStudent._id, studentDocs[2]._id], status: 'active' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await Reply.findOneAndUpdate(
      { discussion: disc._id, author: secondStudent._id },
      {
        discussion: disc._id,
        author: secondStudent._id,
        content: 'Great question! In production, we commonly serve ML models via microservices (FastAPI/Python) and orchestrate user workflows through Node.js Express APIs.'
      },
      { upsert: true }
    );
  }
  console.log('✅ Discussions and community replies initialized');

  // Technology Clubs (Section 19)
  const clubsData = [
    {
      name: 'AI & Data Innovators Club',
      description: 'Collaborative student community building open-source machine learning models, hosting paper readings, and participating in Kaggle challenges.',
      category: 'Artificial Intelligence',
      leader: firstStudent._id,
      members: [firstStudent._id, secondStudent._id, studentDocs[4]._id],
      maxMembers: 50,
      activities: ['Bi-weekly Paper Reading', 'Kaggle Competitions', 'Model Deployment Workshops']
    },
    {
      name: 'Full Stack Web Artisans',
      description: 'Hands-on developer community focusing on modern web development, performance optimization, and open-source contributions.',
      category: 'Web Development',
      leader: secondStudent._id,
      members: [secondStudent._id, firstStudent._id, studentDocs[2]._id],
      maxMembers: 50,
      activities: ['Code Sprints', 'Architecture Reviews', 'Live Hackathons']
    },
    {
      name: 'Cybersecurity & Cloud Circle',
      description: 'Network security enthusiasts exploring ethical hacking, cloud defense architectures, and CTF challenges.',
      category: 'Cybersecurity',
      leader: studentDocs[3]._id,
      members: [studentDocs[3]._id, studentDocs[4]._id],
      maxMembers: 40,
      activities: ['CTF Practice', 'Vulnerability Analysis', 'Cloud Security Audits']
    }
  ];

  for (const c of clubsData) {
    await Club.findOneAndUpdate(
      { name: c.name },
      { ...c, status: 'active' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log('✅ Technology clubs initialized');

  // Example Messages (Section 20)
  await Message.findOneAndUpdate(
    { sender: firstStudent._id, receiver: secondStudent._id, subject: 'Welcome to the AI Club' },
    {
      sender: firstStudent._id,
      senderId: firstStudent._id,
      receiver: secondStudent._id,
      receiverId: secondStudent._id,
      subject: 'Welcome to the AI Club',
      message: 'Hey Karthi! Welcome to the AI & Data Innovators Club. Excited to collaborate on our upcoming hackathon project!',
      read: false
    },
    { upsert: true }
  );
  console.log('✅ Sample messages initialized');

  console.log('====================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log('----------------------------------------------------');
  console.log(`👤 Admin: ${admin.email} (password configured via ADMIN_PASSWORD)`);
  console.log(`🎓 Demo student accounts initialized (password configured via STUDENT_PASSWORD)`);
  console.log(`🏆 Top 3 Students ready with XP: Sudesh (680), Karthi (520), Sugumar (440)`);
  console.log('====================================================');

  if (options.exitProcess !== false && require.main === module) {
    process.exit(0);
  }
}

if (require.main === module) {
  seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = seed;
