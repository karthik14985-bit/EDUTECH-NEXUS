// Exact 4 Courses required by EDUTECH NEXUS specification (10 lessons each)
const coursesData = [
  {
    title: 'AI Fundamentals',
    slug: 'ai-fundamentals',
    category: 'Artificial Intelligence',
    description: 'Learn the fundamentals of Artificial Intelligence, AI concepts, intelligent systems and practical applications.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
    instructor: 'Dr. A. Ramanathan (AI Research Lead)',
    duration: '6 weeks',
    difficulty: 'Beginner',
    level: 'Beginner',
    xp: 500,
    xpReward: 500,
    totalLessons: 10,
    status: 'active',
    requirements: [
      'Basic computer knowledge',
      'Curiosity about intelligent systems',
      'No prior programming background required'
    ],
    learningOutcomes: [
      'Understand core definitions, history, and taxonomy of Artificial Intelligence',
      'Analyze intelligent agent architectures and environmental interactions',
      'Master search algorithms: BFS, DFS, heuristic and A* search techniques',
      'Examine knowledge representation, semantic networks, and logic systems',
      'Explore ethical frameworks, fairness, and safety in modern AI deployments'
    ],
    lessons: [
      {
        lessonNumber: 1,
        title: 'Introduction to Artificial Intelligence',
        description: 'Explore what defines intelligence, Turing tests, Dartmouth conference origins, and modern AI paradigms.',
        learningObjectives: ['Define artificial intelligence', 'Differentiate between narrow, general, and super AI', 'Understand modern AI landscape'],
        duration: '20 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'JMUxmLyrhSk',
        videoUrl: 'https://www.youtube.com/watch?v=JMUxmLyrhSk',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 2,
        title: 'History and Evolution of AI',
        description: 'From symbolic AI and the expert system boom to AI winters and the deep learning renaissance.',
        learningObjectives: ['Trace the chronological timeline of AI', 'Understand the factors that caused AI winters', 'Identify drivers of deep learning breakthroughs'],
        duration: '22 minutes',
        videoType: 'youtube',
        youtubeVideoId: '0yCJMt8ChCw',
        videoUrl: 'https://www.youtube.com/watch?v=0yCJMt8ChCw',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 3,
        title: 'AI Applications',
        description: 'Analyze real-world industrial deployments in healthcare, finance, autonomous driving, and natural language.',
        learningObjectives: ['Survey key application areas of AI', 'Evaluate cost vs benefit of automated decisions', 'Recognize sector-specific AI requirements'],
        duration: '25 minutes',
        videoType: 'youtube',
        youtubeVideoId: '5q87K1WaoFI',
        videoUrl: 'https://www.youtube.com/watch?v=5q87K1WaoFI',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 4,
        title: 'Intelligent Agents',
        description: 'Agents, sensors, actuators, and environments (PEAS formulation) and agent types (reflex, goal-based, utility).',
        learningObjectives: ['Formulate PEAS descriptors for any agent', 'Distinguish simple reflex from goal-based agents', 'Understand environmental properties'],
        duration: '24 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'z_5gqXz3c1U',
        videoUrl: 'https://www.youtube.com/watch?v=z_5gqXz3c1U',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 5,
        title: 'Problem Solving in AI',
        description: 'State space representations, problem formulations, state graphs, and search strategy trade-offs.',
        learningObjectives: ['Formulate problems as state spaces', 'Define initial state, actions, transition models, and goal tests', 'Analyze state space complexity'],
        duration: '26 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'gTzY2qGqCrc',
        videoUrl: 'https://www.youtube.com/watch?v=gTzY2qGqCrc',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 6,
        title: 'Knowledge Representation',
        description: 'Representing knowledge through propositional logic, first-order predicate calculus, and ontologies.',
        learningObjectives: ['Express domain knowledge using predicate logic', 'Understand ontological hierarchies', 'Apply inference rules and resolution'],
        duration: '28 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'b_fLhUfL0V0',
        videoUrl: 'https://www.youtube.com/watch?v=b_fLhUfL0V0',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 7,
        title: 'Search Techniques',
        description: 'Uninformed vs informed search, Breadth-First, Depth-First, Greedy Best-First, and A* Search with heuristics.',
        learningObjectives: ['Implement BFS and DFS traversals', 'Define admissible and consistent heuristics', 'Execute A* search on graph topologies'],
        duration: '30 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'D14TY5Z1h3w',
        videoUrl: 'https://www.youtube.com/watch?v=D14TY5Z1h3w',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 8,
        title: 'AI Ethics and Responsible AI',
        description: 'Bias in training corpora, algorithmic fairness, intellectual property, transparency, and European AI regulations.',
        learningObjectives: ['Identify algorithmic bias sources', 'Design fairness checkpoints in AI pipelines', 'Understand data governance and privacy mandates'],
        duration: '25 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'B_wQ9fTzKbg',
        videoUrl: 'https://www.youtube.com/watch?v=B_wQ9fTzKbg',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 9,
        title: 'Real-World AI Systems',
        description: 'End-to-end case studies: recommender engines, computer vision inspection, and conversational assistants.',
        learningObjectives: ['Architect scalable AI inference pipelines', 'Balance latency vs model precision', 'Monitor model drift in production'],
        duration: '27 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'ukzFI9rgwfU',
        videoUrl: 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 10,
        title: 'AI Mini Project',
        description: 'Construct a complete intelligent classifier: dataset curation, preprocessing, model evaluation, and deployment.',
        learningObjectives: ['Synthesize concepts into a functioning AI prototype', 'Validate accuracy metrics', 'Prepare for final certification quiz'],
        duration: '35 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'wpNrmS_2w0I',
        videoUrl: 'https://www.youtube.com/watch?v=wpNrmS_2w0I',
        videoFile: '',
        xp: 50
      }
    ],
    quiz: {
      title: 'AI Fundamentals Final Certification Quiz',
      passPercentage: 70,
      questions: [
        {
          questionNumber: 1,
          questionText: 'What does the term "Artificial Intelligence" primarily refer to?',
          options: [
            'Machines or software capable of mimicking human cognitive functions',
            'Hardware that processes electrical currents faster than human synapses',
            'Any computer program containing more than 1,000 lines of code',
            'A database system for storing numerical values'
          ],
          correctAnswer: 0,
          explanation: 'AI refers to algorithmic systems designed to perceive environments, reason, and perform tasks traditionally requiring human cognition.'
        },
        {
          questionNumber: 2,
          questionText: 'Who coined the term "Artificial Intelligence" at the Dartmouth Summer Research Project in 1956?',
          options: ['Alan Turing', 'John McCarthy', 'Marvin Minsky', 'Geoffrey Hinton'],
          correctAnswer: 1,
          explanation: 'John McCarthy organized the 1956 Dartmouth conference and coined the term "Artificial Intelligence".'
        },
        {
          questionNumber: 3,
          questionText: 'In PEAS descriptor for intelligent agents, what does PEAS stand for?',
          options: [
            'Performance measure, Environment, Actuators, Sensors',
            'Program, Execution, Actions, Signals',
            'Perception, Evaluation, Algorithms, State',
            'Prediction, Estimation, Accuracy, System'
          ],
          correctAnswer: 0,
          explanation: 'PEAS stands for Performance measure, Environment, Actuators, and Sensors.'
        },
        {
          questionNumber: 4,
          questionText: 'Which search algorithm uses a heuristic function h(n) combined with exact path cost g(n)?',
          options: ['Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'A* Search', 'Linear Search'],
          correctAnswer: 2,
          explanation: 'A* search uses evaluation function f(n) = g(n) + h(n), where g(n) is the cost to reach node n and h(n) is heuristic estimate to goal.'
        },
        {
          questionNumber: 5,
          questionText: 'What makes a heuristic "admissible" in A* tree search?',
          options: [
            'It never overestimates the true cost to reach the goal',
            'It guarantees that search depth never exceeds 10',
            'It calculates exact probabilities using Bayes rule',
            'It executes in constant O(1) time'
          ],
          correctAnswer: 0,
          explanation: 'An admissible heuristic never overestimates the actual minimal cost to reach a goal state.'
        },
        {
          questionNumber: 6,
          questionText: 'What characterizes an AI agent whose actions depend solely on the current percept rather than percept history?',
          options: ['Simple Reflex Agent', 'Goal-Based Agent', 'Utility-Based Agent', 'Learning Agent'],
          correctAnswer: 0,
          explanation: 'Simple reflex agents select actions based solely on the current percept using condition-action rules.'
        },
        {
          questionNumber: 7,
          questionText: 'Which formal logic system allows statements about objects, relations, and quantifiers (forall and exists)?',
          options: ['Propositional Logic', 'First-Order Predicate Logic', 'Boolean Algebra', 'Fuzzy Set Theory'],
          correctAnswer: 1,
          explanation: 'First-Order Logic (FOL) extends propositional logic with predicates, functions, objects, and quantifiers.'
        },
        {
          questionNumber: 8,
          questionText: 'What caused the historical "AI Winters"?',
          options: [
            'Excessive hype followed by inability of contemporary hardware and symbolic approaches to deliver promised results',
            'Global cooling events affecting data centers',
            'Complete governmental bans on computational research',
            'The invention of the quantum computer'
          ],
          correctAnswer: 0,
          explanation: 'AI Winters occurred when high expectations clashed with hardware and computational limitations, leading to funding cuts.'
        },
        {
          questionNumber: 9,
          questionText: 'Which ethical concern in AI arises when training data reflects historical human prejudices?',
          options: ['Algorithmic Bias', 'Overclocking', 'Memory Leakage', 'Thread Deadlock'],
          correctAnswer: 0,
          explanation: 'Algorithmic bias occurs when systemic prejudices in historical training data are encoded into model predictions.'
        },
        {
          questionNumber: 10,
          questionText: 'What is the benchmark proposed by Alan Turing to evaluate machine intelligence through conversational indistinguishability?',
          options: ['The Turing Test', 'The Halting Test', 'The P vs NP Test', 'The Von Neumann Check'],
          correctAnswer: 0,
          explanation: 'The Turing Test assesses whether an interrogator can distinguish a machine from a human based on written responses.'
        }
      ]
    }
  },

  {
    title: 'Python Programming',
    slug: 'python-programming',
    category: 'Programming',
    description: 'Master Python programming from syntax fundamentals, object-oriented design to building real-world automation and projects.',
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
    instructor: 'K. Sundaram (Senior Principal Architect)',
    duration: '6 weeks',
    difficulty: 'Beginner',
    level: 'Beginner',
    xp: 500,
    xpReward: 500,
    totalLessons: 10,
    status: 'active',
    requirements: [
      'Basic computer knowledge',
      'No prior programming background required',
      'Computer with Python 3 installed'
    ],
    learningOutcomes: [
      'Write clean, readable Python code adhering to PEP 8 standards',
      'Utilize fundamental variables, strings, integers, floats, and booleans',
      'Construct branching logic with if-elif-else and repetitive loops',
      'Organize scalable programs using functions, modules, and namespaces',
      'Leverage core data structures (lists, tuples, dictionaries, sets)',
      'Apply Object-Oriented Programming (Classes, Methods, Inheritance)'
    ],
    lessons: [
      {
        lessonNumber: 1,
        title: 'Introduction to Python',
        description: 'Install Python, set up your development environment, understand interpreted vs compiled execution, and run your first script.',
        learningObjectives: ['Install Python 3', 'Run scripts in the REPL and IDE', 'Print output and handle standard input'],
        duration: '18 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'kqtD5dpn9C8',
        videoUrl: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 2,
        title: 'Variables and Data Types',
        description: 'Explore dynamic typing, integers, floats, complex numbers, strings, booleans, and type casting functions.',
        learningObjectives: ['Declare variable identifiers', 'Perform type casting with int(), float(), str()', 'Format strings with f-strings'],
        duration: '22 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'khKv-8q7YmY',
        videoUrl: 'https://www.youtube.com/watch?v=khKv-8q7YmY',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 3,
        title: 'Operators and Expressions',
        description: 'Arithmetic, comparison, logical, assignment, bitwise, membership (in), and identity (is) operators.',
        learningObjectives: ['Evaluate operator precedence', 'Combine logical statements with and, or, not', 'Use membership operators on collections'],
        duration: '20 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'v5MR5JnKcZI',
        videoUrl: 'https://www.youtube.com/watch?v=v5MR5JnKcZI',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 4,
        title: 'Conditional Statements',
        description: 'Build decision-making workflows using if, elif, and else branching, nested conditions, and ternary expressions.',
        learningObjectives: ['Construct multi-branch condition trees', 'Avoid common indentation traps', 'Write concise ternary expressions'],
        duration: '25 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'DZwmZ8Usvnk',
        videoUrl: 'https://www.youtube.com/watch?v=DZwmZ8Usvnk',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 5,
        title: 'Loops',
        description: 'Definite iteration with for loops, indefinite iteration with while loops, break, continue, and the else clause on loops.',
        learningObjectives: ['Iterate using range(), enumerate(), and zip()', 'Control loop flow with break and continue', 'Utilize the loop-else construct'],
        duration: '24 minutes',
        videoType: 'youtube',
        youtubeVideoId: '6iF8Xb7Z3wQ',
        videoUrl: 'https://www.youtube.com/watch?v=6iF8Xb7Z3wQ',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 6,
        title: 'Functions',
        description: 'Define reusable functions, parameters, default arguments, *args, **kwargs, return values, and variable scope (LEGB rule).',
        learningObjectives: ['Define modular functions with def', 'Harness variable positional and keyword arguments', 'Understand local, global, and nonlocal scope'],
        duration: '28 minutes',
        videoType: 'youtube',
        youtubeVideoId: '9Os0o3wzS_I',
        videoUrl: 'https://www.youtube.com/watch?v=9Os0o3wzS_I',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 7,
        title: 'Lists, Tuples and Dictionaries',
        description: 'Master mutable lists, immutable tuples, key-value dictionary mappings, set operations, and list comprehensions.',
        learningObjectives: ['Manipulate list elements and slicing', 'Leverage dictionary fast lookups and methods', 'Write idiomatic list comprehensions'],
        duration: '32 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'W8KRzm-HUcc',
        videoUrl: 'https://www.youtube.com/watch?v=W8KRzm-HUcc',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 8,
        title: 'Object-Oriented Programming',
        description: 'Classes, instance attributes, __init__ constructor, self parameter, encapsulation, inheritance, and polymorphism.',
        learningObjectives: ['Define custom classes and instantiate objects', 'Implement single and multiple inheritance', 'Override superclass methods with super()'],
        duration: '35 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'JeznW_7DlB0',
        videoUrl: 'https://www.youtube.com/watch?v=JeznW_7DlB0',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 9,
        title: 'File Handling and Exceptions',
        description: 'Read and write text and JSON files using with context managers, and handle runtime errors with try-except-finally.',
        learningObjectives: ['Safely open and close files with context managers', 'Handle specific exception types gracefully', 'Serialize data with Python json module'],
        duration: '28 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'NIWwJbo-9_8',
        videoUrl: 'https://www.youtube.com/watch?v=NIWwJbo-9_8',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 10,
        title: 'Python Mini Project',
        description: 'Build a complete CLI-based Student Management System integrating OOP, dictionaries, and file persistence.',
        learningObjectives: ['Architect a multi-class Python application', 'Persist and retrieve structured records', 'Prepare for final course examination'],
        duration: '36 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'pdy33803138',
        videoUrl: 'https://www.youtube.com/watch?v=pdy33803138',
        videoFile: '',
        xp: 50
      }
    ],
    quiz: {
      title: 'Python Programming Final Certification Quiz',
      passPercentage: 70,
      questions: [
        {
          questionNumber: 1,
          questionText: 'Which keyword is used to declare a function in Python?',
          options: ['func', 'function', 'def', 'define'],
          correctAnswer: 2,
          explanation: 'In Python, the "def" keyword begins a function definition header.'
        },
        {
          questionNumber: 2,
          questionText: 'What is the key difference between a Python list and a Python tuple?',
          options: [
            'Lists are mutable while tuples are immutable',
            'Tuples can hold numbers while lists can only hold strings',
            'Lists require curly brackets {} while tuples use square brackets []',
            'Tuples cannot be indexed or sliced'
          ],
          correctAnswer: 0,
          explanation: 'Lists can be modified after creation (mutable), whereas tuples cannot have their elements altered (immutable).'
        },
        {
          questionNumber: 3,
          questionText: 'What is the output of the expression: type(3 / 2)?',
          options: ['int', 'float', 'decimal', 'double'],
          correctAnswer: 1,
          explanation: 'In Python 3, the single slash division operator "/" always produces a float result (1.5).'
        },
        {
          questionNumber: 4,
          questionText: 'Which statement immediately exits the nearest enclosing loop prematurely?',
          options: ['continue', 'pass', 'break', 'return'],
          correctAnswer: 2,
          explanation: 'The "break" statement terminates execution of the containing loop immediately.'
        },
        {
          questionNumber: 5,
          questionText: 'What does the __init__ method signify in a Python class?',
          options: [
            'The constructor method that initializes an instance upon creation',
            'A special method for deleting the class definition',
            'A global variable available to all modules',
            'A decorator that turns a function into an async coroutine'
          ],
          correctAnswer: 0,
          explanation: 'The __init__ method is Python’s initializer constructor called automatically when a new object is created.'
        },
        {
          questionNumber: 6,
          questionText: 'How do you safely open a file ensuring it is closed automatically when done?',
          options: [
            'open("file.txt").run()',
            'with open("file.txt", "r") as f:',
            'file.stream("file.txt", auto_close=True)',
            'try { open("file.txt") }'
          ],
          correctAnswer: 1,
          explanation: 'The "with" statement acts as a context manager that guarantees the file descriptor is closed properly.'
        },
        {
          questionNumber: 7,
          questionText: 'Which built-in data structure stores unique elements with no duplicate values?',
          options: ['list', 'dict', 'tuple', 'set'],
          correctAnswer: 3,
          explanation: 'A set is an unordered collection of unique elements that eliminates duplicates automatically.'
        },
        {
          questionNumber: 8,
          questionText: 'What is the result of [x * 2 for x in [1, 2, 3]]?',
          options: ['[1, 2, 3, 1, 2, 3]', '[2, 4, 6]', '[2, 2, 2]', 'Error'],
          correctAnswer: 1,
          explanation: 'This list comprehension multiplies each element by 2, resulting in [2, 4, 6].'
        },
        {
          questionNumber: 9,
          questionText: 'Which keyword is used to handle exceptions caught within a "try" block?',
          options: ['catch', 'except', 'rescue', 'handle'],
          correctAnswer: 1,
          explanation: 'Python uses "except" alongside "try" to catch and process exceptions.'
        },
        {
          questionNumber: 10,
          questionText: 'What parameter must be explicitly passed as the first argument to instance methods in Python classes?',
          options: ['this', 'self', 'cls', 'super'],
          correctAnswer: 1,
          explanation: 'By convention and design, Python passes the object instance as the first parameter named "self".'
        }
      ]
    }
  },

  {
    title: 'AI & Machine Learning',
    slug: 'ai-and-machine-learning',
    category: 'Artificial Intelligence',
    description: 'Master practical machine learning algorithms, statistical data preparation, neural networks, and model deployment.',
    image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=800&q=80',
    instructor: 'Dr. A. Ramanathan (AI Research Lead)',
    duration: '8 weeks',
    difficulty: 'Intermediate',
    level: 'Intermediate',
    xp: 500,
    xpReward: 500,
    totalLessons: 10,
    status: 'active',
    requirements: [
      'Basic Python programming knowledge',
      'Understanding of basic linear algebra and statistics',
      'Familiarity with matrices and plotting'
    ],
    learningOutcomes: [
      'Understand Supervised, Unsupervised, and Reinforcement learning paradigms',
      'Clean raw data, handle missing values, and normalize features',
      'Build and train Linear and Multiple Regression predictors',
      'Implement Classification models (Logistic Regression, Decision Trees)',
      'Discover latent groupings with K-Means and Hierarchical Clustering',
      'Perform thorough validation using Confusion Matrix, ROC-AUC, and F1-Score'
    ],
    lessons: [
      {
        lessonNumber: 1,
        title: 'Introduction to Machine Learning',
        description: 'Understand the difference between traditional rule-based coding and data-driven learning systems.',
        learningObjectives: ['Define the ML paradigm', 'Identify inputs, features, and targets', 'Set up Scikit-Learn and NumPy'],
        duration: '22 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'ukzFI9rgwfU',
        videoUrl: 'https://www.youtube.com/watch?v=ukzFI9rgwfU',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 2,
        title: 'Types of Machine Learning',
        description: 'Differentiate between supervised learning, unsupervised clustering, semi-supervised, and reinforcement learning.',
        learningObjectives: ['Classify real problems into ML categories', 'Identify continuous vs categorical targets', 'Understand feedback in RL'],
        duration: '24 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'olFxW7kdtP8',
        videoUrl: 'https://www.youtube.com/watch?v=olFxW7kdtP8',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 3,
        title: 'Data Preparation',
        description: 'Missing value imputation, outlier detection, standard scaling, min-max normalization, and one-hot categorical encoding.',
        learningObjectives: ['Clean datasets with Pandas', 'Scale numerical features using StandardScaler', 'Encode categorical columns'],
        duration: '28 minutes',
        videoType: 'youtube',
        youtubeVideoId: '0LTXpeRC3_8',
        videoUrl: 'https://www.youtube.com/watch?v=0LTXpeRC3_8',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 4,
        title: 'Linear Regression',
        description: 'Formulate ordinary least squares, compute cost with Mean Squared Error, and optimize weights via gradient descent.',
        learningObjectives: ['Derive linear regression cost function', 'Interpret slope and intercept coefficients', 'Evaluate R-squared goodness-of-fit'],
        duration: '30 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'E5RjzSK0fvY',
        videoUrl: 'https://www.youtube.com/watch?v=E5RjzSK0fvY',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 5,
        title: 'Classification',
        description: 'Logistic regression for binary outcomes, sigmoid activation function, decision boundaries, and log-loss cost.',
        learningObjectives: ['Map linear outputs to probabilities with Sigmoid', 'Set classification thresholds', 'Compare binary vs multi-class classification'],
        duration: '32 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'yIYKR4sgzI8',
        videoUrl: 'https://www.youtube.com/watch?v=yIYKR4sgzI8',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 6,
        title: 'Decision Trees',
        description: 'Entropy, Information Gain, Gini impurity, tree pruning to curb overfitting, and Random Forest ensemble basics.',
        learningObjectives: ['Calculate Gini impurity and Information Gain', 'Construct decision trees in Scikit-Learn', 'Mitigate overfitting via tree depth constraints'],
        duration: '30 minutes',
        videoType: 'youtube',
        youtubeVideoId: '_L39rN6gz7Y',
        videoUrl: 'https://www.youtube.com/watch?v=_L39rN6gz7Y',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 7,
        title: 'Clustering',
        description: 'Unsupervised partitioning with K-Means, centroid optimization, Elbow method, and silhouette scores.',
        learningObjectives: ['Formulate K-Means centroid update algorithm', 'Determine optimal k using the Elbow curve', 'Visualize customer segmentation clusters'],
        duration: '28 minutes',
        videoType: 'youtube',
        youtubeVideoId: '4b5d3muPQmA',
        videoUrl: 'https://www.youtube.com/watch?v=4b5d3muPQmA',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 8,
        title: 'Model Evaluation',
        description: 'Confusion matrix metrics: precision, recall, specificity, F1-score, ROC-AUC curve, and k-fold cross-validation.',
        learningObjectives: ['Construct confusion matrices', 'Balance precision vs recall trade-offs', 'Execute k-fold cross validation'],
        duration: '30 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'wpNrmS_2w0I',
        videoUrl: 'https://www.youtube.com/watch?v=wpNrmS_2w0I',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 9,
        title: 'Feature Engineering',
        description: 'Polynomial features, interaction terms, dimension reduction via PCA, and automated feature selection.',
        learningObjectives: ['Derive domain-specific feature columns', 'Perform Principal Component Analysis (PCA)', 'Select most informative features'],
        duration: '26 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'f5NWvyS-g6A',
        videoUrl: 'https://www.youtube.com/watch?v=f5NWvyS-g6A',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 10,
        title: 'Machine Learning Mini Project',
        description: 'Develop an end-to-end predictive machine learning model pipeline and export weights for serving.',
        learningObjectives: ['Build a production-ready model pipeline', 'Export model using joblib / pickle', 'Prepare for final certification quiz'],
        duration: '35 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'aircAruvnKk',
        videoUrl: 'https://www.youtube.com/watch?v=aircAruvnKk',
        videoFile: '',
        xp: 50
      }
    ],
    quiz: {
      title: 'AI & Machine Learning Final Certification Quiz',
      passPercentage: 70,
      questions: [
        {
          questionNumber: 1,
          questionText: 'Which type of Machine Learning problem involves predicting a continuous numerical value?',
          options: ['Classification', 'Regression', 'Clustering', 'Reinforcement Learning'],
          correctAnswer: 1,
          explanation: 'Regression algorithms predict continuous real-valued numeric outputs, such as house prices or temperature.'
        },
        {
          questionNumber: 2,
          questionText: 'What activation function squashes any real-valued number into a probability range between 0 and 1?',
          options: ['ReLU', 'Sigmoid', 'Linear', 'Step'],
          correctAnswer: 1,
          explanation: 'The Sigmoid function σ(z) = 1 / (1 + e^-z) maps values into the (0, 1) probability range.'
        },
        {
          questionNumber: 3,
          questionText: 'What does a high training accuracy coupled with a significantly lower test accuracy typically indicate?',
          options: ['Underfitting', 'Overfitting', 'Optimal convergence', 'High bias'],
          correctAnswer: 1,
          explanation: 'Overfitting occurs when a model memorizes training noise and fails to generalize to unseen test data.'
        },
        {
          questionNumber: 4,
          questionText: 'Which metric calculates the harmonic mean of Precision and Recall?',
          options: ['Accuracy', 'ROC-AUC', 'F1-Score', 'Mean Squared Error'],
          correctAnswer: 2,
          explanation: 'The F1-Score is the harmonic mean of precision and recall: 2 * (Precision * Recall) / (Precision + Recall).'
        },
        {
          questionNumber: 5,
          questionText: 'What method is commonly used to find the optimal number of clusters (k) in K-Means?',
          options: ['Elbow Method', 'Gradient Descent', 'Backpropagation', 'Greedy Search'],
          correctAnswer: 0,
          explanation: 'The Elbow Method plots the within-cluster sum of squares (WCSS) against k to find the point where distortion slows.'
        },
        {
          questionNumber: 6,
          questionText: 'Which algorithm recursively splits data based on Information Gain or Gini Impurity?',
          options: ['K-Nearest Neighbors', 'Decision Tree', 'Linear Regression', 'K-Means'],
          correctAnswer: 1,
          explanation: 'Decision Trees split node features to maximize Information Gain or minimize Gini impurity.'
        },
        {
          questionNumber: 7,
          questionText: 'What technique prevents data leakage during model training and evaluation?',
          options: [
            'Fitting transformers (like StandardScaler) solely on the training split before transforming the test split',
            'Fitting the scaler on the entire dataset before splitting',
            'Removing all labels from the dataset entirely',
            'Increasing the learning rate to 10.0'
          ],
          correctAnswer: 0,
          explanation: 'Fitting scalers or imputers exclusively on training data prevents test data information from leaking into the training pipeline.'
        },
        {
          questionNumber: 8,
          questionText: 'What is the primary objective of Principal Component Analysis (PCA)?',
          options: [
            'Unsupervised dimensionality reduction while maximizing preserved variance',
            'Supervised classification using support vectors',
            'Calculating gradient updates for backpropagation',
            'Balancing class distributions using oversampling'
          ],
          correctAnswer: 0,
          explanation: 'PCA projects high-dimensional data onto orthogonal axes that maximize variance, reducing dimensionality.'
        },
        {
          questionNumber: 9,
          questionText: 'In a confusion matrix, what is a False Positive?',
          options: [
            'An instance that is truly negative but incorrectly predicted as positive',
            'An instance that is truly positive and correctly predicted as positive',
            'An instance that is truly negative and correctly predicted as negative',
            'An instance that is truly positive but incorrectly predicted as negative'
          ],
          correctAnswer: 0,
          explanation: 'A False Positive (Type I error) occurs when a negative case is incorrectly classified as positive.'
        },
        {
          questionNumber: 10,
          questionText: 'What optimization algorithm updates model weights iteratively in the opposite direction of the loss gradient?',
          options: ['Gradient Descent', 'K-Means Centroid Shift', 'A* Search', 'Alpha-Beta Pruning'],
          correctAnswer: 0,
          explanation: 'Gradient Descent iteratively subtracts a fraction of the cost gradient from weights to minimize loss.'
        }
      ]
    }
  },

  {
    title: 'Full Stack Development',
    slug: 'full-stack-development',
    category: 'Web Development',
    description: 'Learn modern frontend and backend development and build complete web applications.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
    instructor: 'P. Vignesh (Lead Full Stack Engineer)',
    duration: '10 weeks',
    difficulty: 'Intermediate',
    level: 'Intermediate',
    xp: 500,
    xpReward: 500,
    totalLessons: 10,
    status: 'active',
    requirements: [
      'Basic computer knowledge',
      'Basic programming knowledge'
    ],
    learningOutcomes: [
      'HTML',
      'CSS',
      'JavaScript',
      'Node.js',
      'Express.js',
      'MongoDB',
      'REST APIs',
      'Full-stack project development'
    ],
    lessons: [
      {
        lessonNumber: 1,
        title: 'HTML Fundamentals',
        description: 'Semantic HTML5 structure, doctype declaration, document hierarchy, forms, inputs, and accessibility tags.',
        learningObjectives: ['Structure semantic documents with header, nav, main, footer', 'Build accessible forms with proper label linkages', 'Validate HTML documents according to W3C standards'],
        duration: '20 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'kUMe1FH4CHE',
        videoUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 2,
        title: 'CSS Fundamentals',
        description: 'The CSS box model, cascade specificity, typography, custom variables, positioning, and modern flexbox layouts.',
        learningObjectives: ['Master margins, borders, padding, and content dimensions', 'Compute specificity weights', 'Create multi-item layouts with CSS Flexbox'],
        duration: '25 minutes',
        videoType: 'youtube',
        youtubeVideoId: '1Rs2ND1ryYc',
        videoUrl: 'https://www.youtube.com/watch?v=1Rs2ND1ryYc',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 3,
        title: 'Responsive Web Design',
        description: 'Media queries, fluid viewports, mobile-first design, CSS Grid two-dimensional layouts, and glassmorphism styling.',
        learningObjectives: ['Implement responsive breakpoints for mobile, tablet, and desktop', 'Create two-dimensional grid layouts with CSS Grid', 'Style modern glassmorphic cards and buttons'],
        duration: '26 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'srvUrASNj0s',
        videoUrl: 'https://www.youtube.com/watch?v=srvUrASNj0s',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 4,
        title: 'JavaScript Fundamentals',
        description: 'Variables (let, const), data types, functions, arrow syntax, template literals, arrays, and object destructuring.',
        learningObjectives: ['Understand block scope vs functional scope', 'Use modern ES6+ array methods: map, filter, reduce', 'Destructure nested objects and arrays'],
        duration: '30 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'W6NZfCO5SIk',
        videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 5,
        title: 'DOM and Events',
        description: 'Document Object Model traversal, querying elements, manipulating styles, event listeners, bubbling, and delegation.',
        learningObjectives: ['Select and mutate DOM nodes dynamically', 'Attach listeners with addEventListener', 'Handle event propagation and delegation'],
        duration: '28 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'y17RuWkWdn8',
        videoUrl: 'https://www.youtube.com/watch?v=y17RuWkWdn8',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 6,
        title: 'Node.js Fundamentals',
        description: 'Node runtime architecture, the V8 engine, asynchronous non-blocking event loop, npm ecosystem, and commonJS modules.',
        learningObjectives: ['Execute JavaScript on the server environment', 'Require built-in modules (fs, path, http)', 'Manage package.json dependencies with npm'],
        duration: '28 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'TlB_eWDSMt4',
        videoUrl: 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 7,
        title: 'Express.js',
        description: 'Building web servers with Express, routing parameters, query strings, custom middleware, and serving static assets.',
        learningObjectives: ['Create Express applications and HTTP route handlers', 'Write custom middleware for logging and authentication', 'Handle JSON request bodies with express.json()'],
        duration: '32 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'L72fhGm1tfE',
        videoUrl: 'https://www.youtube.com/watch?v=L72fhGm1tfE',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 8,
        title: 'MongoDB and Mongoose',
        description: 'NoSQL document database fundamentals, MongoDB Atlas connection, defining Mongoose schemas, models, and validation.',
        learningObjectives: ['Design schema definitions and relationships in Mongoose', 'Perform CRUD queries (find, create, update, delete)', 'Implement schema validation rules and pre-save hooks'],
        duration: '34 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'DZBGEExL2eE',
        videoUrl: 'https://www.youtube.com/watch?v=DZBGEExL2eE',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 9,
        title: 'REST API Development',
        description: 'Architecting RESTful endpoints, HTTP verb standards (GET, POST, PUT, DELETE), status codes, and JWT authentication.',
        learningObjectives: ['Design RESTful resource URI structures', 'Send appropriate HTTP status codes (200, 201, 400, 401, 404, 500)', 'Protect sensitive API endpoints using JWT authentication'],
        duration: '35 minutes',
        videoType: 'youtube',
        youtubeVideoId: 'pKd0Rpw7O48',
        videoUrl: 'https://www.youtube.com/watch?v=pKd0Rpw7O48',
        videoFile: '',
        xp: 50
      },
      {
        lessonNumber: 10,
        title: 'Full Stack Final Project',
        description: 'Connect frontend HTML/CSS/JS with Express and MongoDB to deliver a complete production application.',
        learningObjectives: ['Connect client fetch API calls with backend Express endpoints', 'Implement token persistence in browser localStorage', 'Prepare for final certification quiz and certificate claim'],
        duration: '40 minutes',
        videoType: 'youtube',
        youtubeVideoId: '7CqJlxBYj-M',
        videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
        videoFile: '',
        xp: 50
      }
    ],
    quiz: {
      title: 'Full Stack Development Final Certification Quiz',
      passPercentage: 70,
      questions: [
        {
          questionNumber: 1,
          questionText: 'What does HTML stand for?',
          options: [
            'Hyper Text Markup Language',
            'High Text Machine Language',
            'Hyper Tool Multi Language',
            'Home Tool Markup Language'
          ],
          correctAnswer: 0,
          explanation: 'HTML stands for HyperText Markup Language, the standard markup language for documents designed to be displayed in a web browser.'
        },
        {
          questionNumber: 2,
          questionText: 'Which CSS layout model provides one-dimensional linear flow along either a row or column?',
          options: ['CSS Grid', 'CSS Flexbox', 'Float Positioning', 'Table Layout'],
          correctAnswer: 1,
          explanation: 'Flexbox is a 1-dimensional layout module designed for distributing space along a single main axis (row or column).'
        },
        {
          questionNumber: 3,
          questionText: 'Which HTTP method is conventionally used to create a new resource on the server?',
          options: ['GET', 'POST', 'PUT', 'DELETE'],
          correctAnswer: 1,
          explanation: 'In RESTful architecture, HTTP POST is the standard method used to submit data and create a new resource.'
        },
        {
          questionNumber: 4,
          questionText: 'What is the purpose of the express.json() middleware in Express.js?',
          options: [
            'Parses incoming requests with JSON payloads and populates req.body',
            'Compiles JavaScript into machine code',
            'Encrypts all database collections into JSON strings',
            'Compresses outgoing images into JSON format'
          ],
          correctAnswer: 0,
          explanation: 'express.json() is built-in middleware that parses incoming request bodies formatted as JSON.'
        },
        {
          questionNumber: 5,
          questionText: 'What kind of database is MongoDB?',
          options: [
            'Relational SQL Database',
            'NoSQL Document-Oriented Database',
            'Graph-only Database',
            'Flat-file In-Memory Buffer'
          ],
          correctAnswer: 1,
          explanation: 'MongoDB is a leading NoSQL document database storing records as BSON (binary JSON) documents.'
        },
        {
          questionNumber: 6,
          questionText: 'What does JWT stand for in web application security?',
          options: ['Java Web Token', 'JSON Web Token', 'Joint Web Transfer', 'JavaScript Web Tool'],
          correctAnswer: 1,
          explanation: 'JWT stands for JSON Web Token, an open standard for securely transmitting information between parties as a JSON object.'
        },
        {
          questionNumber: 7,
          questionText: 'Which method attaches an event handler function to a specified HTML DOM element without overwriting existing handlers?',
          options: ['attach()', 'addEventListener()', 'bindEvent()', 'on()'],
          correctAnswer: 1,
          explanation: 'addEventListener() attaches an event handler to the target element without overwriting existing listeners.'
        },
        {
          questionNumber: 8,
          questionText: 'What HTTP status code represents "401"?',
          options: ['OK', 'Not Found', 'Unauthorized', 'Internal Server Error'],
          correctAnswer: 2,
          explanation: 'HTTP 401 Unauthorized indicates that the request requires authentication credentials or the provided token is invalid.'
        },
        {
          questionNumber: 9,
          questionText: 'In Mongoose, which function is used to convert an ObjectId reference into its full populated document?',
          options: ['.populate()', '.expand()', '.join()', '.include()'],
          correctAnswer: 0,
          explanation: 'The Mongoose .populate() method automatically replaces specified paths in the document with documents from other collections.'
        },
        {
          questionNumber: 10,
          questionText: 'What keyword allows you to pause asynchronous execution inside an async function until a Promise settles?',
          options: ['yield', 'await', 'pause', 'wait'],
          correctAnswer: 1,
          explanation: 'The await expression pauses execution of the surrounding async function until the Promise is fulfilled or rejected.'
        }
      ]
    }
  }
];

module.exports = coursesData;
