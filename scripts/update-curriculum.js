const fs = require('fs');
const path = require('path');

const coursesDataPath = path.join(__dirname, '..', 'backend', 'seed', 'coursesData.js');
let existing = require(coursesDataPath);

// Map titles to exact required titles:
// 1. Full Stack Development
// 2. Artificial Intelligence (AI)
// 3. Machine Learning (ML)
// 4. Python Programming
// 5. Java Programming

// Update existing courses
existing.forEach(c => {
  if (c.title === 'AI Fundamentals') {
    c.title = 'Artificial Intelligence (AI)';
    c.slug = 'artificial-intelligence';
    // set default videos
    c.lessons.forEach((l, idx) => {
      const numStr = String(idx + 1).padStart(2, '0');
      const filenameMap = [
        'lesson-01-introduction-to-artificial-intelligence.mp4',
        'lesson-02-history-and-evolution-of-ai.mp4',
        'lesson-03-ai-applications.mp4',
        'lesson-04-intelligent-agents.mp4',
        'lesson-05-problem-solving-in-ai.mp4',
        'lesson-06-knowledge-representation.mp4',
        'lesson-07-search-techniques.mp4',
        'lesson-08-ai-ethics-and-responsible-ai.mp4',
        'lesson-09-real-world-ai-systems.mp4',
        'lesson-10-ai-mini-project.mp4'
      ];
      l.defaultVideo = `/videos/ai-fundamentals/${filenameMap[idx] || 'lesson-01-introduction-to-artificial-intelligence.mp4'}`;
      if (!l.videoUrl && l.youtubeVideoId) l.videoUrl = `https://www.youtube.com/watch?v=${l.youtubeVideoId}`;
    });
  } else if (c.title === 'AI & Machine Learning') {
    c.title = 'Machine Learning (ML)';
    c.slug = 'machine-learning';
    c.lessons.forEach((l, idx) => {
      const filenameMap = [
        'lesson-01-introduction-to-machine-learning.mp4',
        'lesson-02-types-of-machine-learning.mp4',
        'lesson-03-data-preparation.mp4',
        'lesson-04-linear-regression.mp4',
        'lesson-05-classification.mp4',
        'lesson-06-decision-trees.mp4',
        'lesson-07-clustering.mp4',
        'lesson-08-model-evaluation.mp4',
        'lesson-09-feature-engineering.mp4',
        'lesson-10-machine-learning-mini-project.mp4'
      ];
      l.defaultVideo = `/videos/ai-and-machine-learning/${filenameMap[idx] || 'lesson-01-introduction-to-machine-learning.mp4'}`;
      if (!l.videoUrl && l.youtubeVideoId) l.videoUrl = `https://www.youtube.com/watch?v=${l.youtubeVideoId}`;
    });
  } else if (c.title === 'Python Programming') {
    c.slug = 'python-programming';
    c.lessons.forEach((l, idx) => {
      const filenameMap = [
        'lesson-01-introduction-to-python.mp4',
        'lesson-02-variables-and-data-types.mp4',
        'lesson-03-operators-and-expressions.mp4',
        'lesson-04-conditional-statements.mp4',
        'lesson-05-loops.mp4',
        'lesson-06-functions.mp4',
        'lesson-07-lists-tuples-and-dictionaries.mp4',
        'lesson-08-object-oriented-programming.mp4',
        'lesson-09-file-handling-and-exceptions.mp4',
        'lesson-10-python-mini-project.mp4'
      ];
      l.defaultVideo = `/videos/python-programming/${filenameMap[idx] || 'lesson-01-introduction-to-python.mp4'}`;
      if (!l.videoUrl && l.youtubeVideoId) l.videoUrl = `https://www.youtube.com/watch?v=${l.youtubeVideoId}`;
    });
  } else if (c.title === 'Full Stack Development') {
    c.slug = 'full-stack-development';
    c.lessons.forEach((l, idx) => {
      const filenameMap = [
        'lesson-01-html-fundamentals.mp4',
        'lesson-02-css-fundamentals.mp4',
        'lesson-03-responsive-web-design.mp4',
        'lesson-04-javascript-fundamentals.mp4',
        'lesson-05-dom-and-events.mp4',
        'lesson-06-node-js-fundamentals.mp4',
        'lesson-07-express-js.mp4',
        'lesson-08-mongodb-and-mongoose.mp4',
        'lesson-09-rest-api-development.mp4',
        'lesson-10-full-stack-final-project.mp4'
      ];
      l.defaultVideo = `/videos/full-stack-development/${filenameMap[idx] || 'lesson-01-html-fundamentals.mp4'}`;
      if (!l.videoUrl && l.youtubeVideoId) l.videoUrl = `https://www.youtube.com/watch?v=${l.youtubeVideoId}`;
    });
  }
});

// Check if Java Programming already exists, if not add it
let javaCourse = existing.find(c => c.title === 'Java Programming');
if (!javaCourse) {
  javaCourse = {
    title: 'Java Programming',
    slug: 'java-programming',
    category: 'Programming',
    description: 'Master object-oriented programming with Java, covering core syntax, classes, inheritance, polymorphism, collections framework, exception handling, and enterprise architecture.',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    instructor: 'K. Sundaram (Principal Java Architect)',
    duration: '8 weeks',
    difficulty: 'Beginner',
    level: 'Beginner',
    xp: 500,
    xpReward: 500,
    totalLessons: 10,
    status: 'active',
    requirements: [
      'Basic algorithmic thinking and computer fundamentals',
      'No prior Java knowledge required; course starts from first principles',
      'JDK 17+ installed on workstation'
    ],
    learningOutcomes: [
      'Understand JVM, JRE, bytecode, and compilation lifecycle',
      'Master object-oriented concepts: encapsulation, inheritance, polymorphism',
      'Leverage Java Collections Framework: ArrayList, HashMap, LinkedList, HashSet',
      'Implement robust exception handling with try-catch-finally and custom exceptions',
      'Build modular, production-ready console and enterprise Java applications'
    ],
    lessons: [
      {
        lessonNumber: 1,
        title: 'Java Fundamentals & JVM Architecture',
        description: 'Understand the Java Virtual Machine (JVM), Bytecode, JRE vs JDK, and compiling your first program.',
        learningObjectives: ['Understand Java compilation & execution', 'Write, compile, and run Hello World', 'Explore JDK tooling'],
        duration: '20 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'eIrMbAQSU34',
        videoUrl: 'https://www.youtube.com/watch?v=eIrMbAQSU34',
        defaultVideo: '/videos/sample-lesson.mp4',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 2,
        title: 'Variables, Data Types & Operators',
        description: 'Primitive types, reference types, type casting, arithmetic, relational, and bitwise operators.',
        learningObjectives: ['Declare and initialize primitives', 'Understand widening vs narrowing casting', 'Use logical and arithmetic operators'],
        duration: '22 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'm4-HM_H7v0k',
        videoUrl: 'https://www.youtube.com/watch?v=m4-HM_H7v0k',
        defaultVideo: '/videos/sample-lesson.mp4',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 3,
        title: 'Control Flow & Decision Making',
        description: 'Master if-else conditions, switch expressions, ternary operators, and logical branching.',
        learningObjectives: ['Structure decision logic in Java', 'Use modern switch expressions', 'Avoid common branch errors'],
        duration: '25 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'ldYLYRNaucM',
        videoUrl: 'https://www.youtube.com/watch?v=ldYLYRNaucM',
        defaultVideo: '/videos/sample-lesson.mp4',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 4,
        title: 'Loops and Iteration Structures',
        description: 'for loops, while loops, do-while loops, enhanced for-each iteration, and loop control keywords.',
        learningObjectives: ['Iterate using for and while loops', 'Use break and continue correctly', 'Avoid infinite loops'],
        duration: '24 minutes',
        videoType: 'youtube',
        youtubeVideoId: '7mK_9pWq89A',
        videoUrl: 'https://www.youtube.com/watch?v=7mK_9pWq89A',
        defaultVideo: '/videos/sample-lesson.mp4',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 5,
        title: 'Classes, Objects & Methods',
        description: 'Class declarations, constructors, method overloading, access modifiers, and memory allocation in Heap vs Stack.',
        learningObjectives: ['Design modular Java classes', 'Implement default and parameterized constructors', 'Understand heap vs stack memory'],
        duration: '28 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'bSrm9RXwBaI',
        videoUrl: 'https://www.youtube.com/watch?v=bSrm9RXwBaI',
        defaultVideo: '/videos/sample-lesson.mp4',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 6,
        title: 'Inheritance & Polymorphism',
        description: 'Code reusability through extends keyword, method overriding (@Override), super keyword, and dynamic method dispatch.',
        learningObjectives: ['Extend base classes with inheritance', 'Override methods dynamically', 'Use polymorphism for flexible APIs'],
        duration: '26 minutes',
        videoType: 'youtube',
        youtubeVideoId: '9Jp44kH_h5c',
        videoUrl: 'https://www.youtube.com/watch?v=9Jp44kH_h5c',
        defaultVideo: '/videos/sample-lesson.mp4',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 7,
        title: 'Abstract Classes & Interfaces',
        description: 'Achieve true abstraction and multiple inheritance of type using abstract classes and Java interfaces.',
        learningObjectives: ['Define contracts using interfaces', 'Implement abstract methods', 'Apply default and static interface methods'],
        duration: '25 minutes',
        videoType: 'youtube',
        youtubeVideoId: '5nU_GqL0-5g',
        videoUrl: 'https://www.youtube.com/watch?v=5nU_GqL0-5g',
        defaultVideo: '/videos/sample-lesson.mp4',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 8,
        title: 'Java Collections Framework',
        description: 'Master List (ArrayList, LinkedList), Set (HashSet, TreeSet), and Map (HashMap, TreeMap) structures.',
        learningObjectives: ['Choose optimal collection classes', 'Iterate and sort collections', 'Understand hash collisions and lookup complexity'],
        duration: '30 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'viTHc_4XfCA',
        videoUrl: 'https://www.youtube.com/watch?v=viTHc_4XfCA',
        defaultVideo: '/videos/sample-lesson.mp4',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 9,
        title: 'Exception Handling & Robust Design',
        description: 'Checked vs unchecked exceptions, try-catch-finally, try-with-resources, throw, throws, and custom exceptions.',
        learningObjectives: ['Handle runtime errors safely', 'Manage resources with try-with-resources', 'Create custom domain exception classes'],
        duration: '26 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'K_-3OLkXGvQ',
        videoUrl: 'https://www.youtube.com/watch?v=K_-3OLkXGvQ',
        defaultVideo: '/videos/sample-lesson.mp4',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 10,
        title: 'Java Capstone: Student Management System',
        description: 'Synthesize core OOP, collections, file persistence, and validation into a complete Java enterprise project.',
        learningObjectives: ['Architect end-to-end application', 'Apply Clean Code and SOLID principles', 'Prepare for technical interviews'],
        duration: '35 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'U_8pG9jO6lI',
        videoUrl: 'https://www.youtube.com/watch?v=U_8pG9jO6lI',
        defaultVideo: '/videos/sample-lesson.mp4',
        videoFile: '',
        xp: 50
      }
    ],
    quiz: {
      title: 'Java Programming Certification Quiz',
      passPercentage: 70,
      questions: [
        {
          questionNumber: 1,
          questionText: 'Which component of Java is responsible for converting bytecode into native machine instructions?',
          options: ['JDK', 'JVM', 'JRE', 'Java Compiler (javac)'],
          correctAnswer: 1,
          explanation: 'The Java Virtual Machine (JVM) executes bytecode and converts it into machine-specific code.'
        },
        {
          questionNumber: 2,
          questionText: 'What is the default value of a boolean instance variable in Java?',
          options: ['true', 'false', '0', 'null'],
          correctAnswer: 1,
          explanation: 'In Java, boolean instance variables default to false.'
        },
        {
          questionNumber: 3,
          questionText: 'Which keyword is used to prevent a class from being inherited in Java?',
          options: ['static', 'final', 'abstract', 'private'],
          correctAnswer: 1,
          explanation: 'A class declared as final cannot be subclassed.'
        },
        {
          questionNumber: 4,
          questionText: 'What is the size of an int data type in Java?',
          options: ['16 bits', '32 bits', '64 bits', 'Platform dependent'],
          correctAnswer: 1,
          explanation: 'In Java, an int is strictly 32 bits (4 bytes) across all platforms.'
        },
        {
          questionNumber: 5,
          questionText: 'Which interface in the Java Collections Framework prohibits duplicate elements?',
          options: ['List', 'Queue', 'Set', 'Map'],
          correctAnswer: 2,
          explanation: 'The Set interface models the mathematical set abstraction and does not allow duplicate entries.'
        },
        {
          questionNumber: 6,
          questionText: 'Which collection class implements a hash table data structure with key-value pairs?',
          options: ['ArrayList', 'HashMap', 'TreeSet', 'LinkedList'],
          correctAnswer: 1,
          explanation: 'HashMap stores elements as key-value pairs with O(1) average lookup time.'
        },
        {
          questionNumber: 7,
          questionText: 'What block is guaranteed to execute regardless of whether an exception is thrown in a try-catch block?',
          options: ['catch', 'finally', 'default', 'resolve'],
          correctAnswer: 1,
          explanation: 'The finally block executes after try and catch blocks, even if an exception occurs.'
        },
        {
          questionNumber: 8,
          questionText: 'Which package is automatically imported into every Java compilation unit without an explicit import statement?',
          options: ['java.util', 'java.io', 'java.lang', 'java.net'],
          correctAnswer: 2,
          explanation: 'java.lang contains core classes like String, Math, Object, and is implicitly imported.'
        },
        {
          questionNumber: 9,
          questionText: 'Can an interface implement another interface in Java?',
          options: ['No, interfaces can only be implemented by classes', 'Yes, using the implements keyword', 'Yes, using the extends keyword', 'No, interfaces cannot inherit'],
          correctAnswer: 2,
          explanation: 'An interface can extend one or more other interfaces using the extends keyword.'
        },
        {
          questionNumber: 10,
          questionText: 'What will happen when attempting to instantiate an abstract class using the new operator?',
          options: ['Compiles fine and returns an empty object', 'Compilation error', 'Throws InstantiationException at runtime', 'Creates a null pointer'],
          correctAnswer: 1,
          explanation: 'Abstract classes cannot be directly instantiated; doing so triggers a compile-time error.'
        }
      ]
    }
  };
  existing.push(javaCourse);
}

// Order courses exactly as required:
// 1. Full Stack Development
// 2. Artificial Intelligence (AI)
// 3. Machine Learning (ML)
// 4. Python Programming
// 5. Java Programming

const order = [
  'Full Stack Development',
  'Artificial Intelligence (AI)',
  'Machine Learning (ML)',
  'Python Programming',
  'Java Programming'
];

const sortedCourses = [];
for (const title of order) {
  const found = existing.find(c => c.title === title);
  if (found) sortedCourses.push(found);
}

const fileContent = `// Exact 5 Courses required by EDUTECH NEXUS specification (10 lessons each)
const coursesData = ${JSON.stringify(sortedCourses, null, 2)};

module.exports = coursesData;
`;

fs.writeFileSync(coursesDataPath, fileContent, 'utf8');
console.log(`Successfully updated ${sortedCourses.length} courses in ${coursesDataPath}`);
sortedCourses.forEach((c, i) => console.log(` ${i + 1}. ${c.title} (${c.lessons.length} lessons)`));

