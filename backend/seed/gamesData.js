// EDUTECH NEXUS — Playzone Games Seed Data
// Includes all 7 educational games + 2 legacy tech challenges

const gamesData = [
  // =========================================================================
  // 1. CODE SPRINT (Rapid-Fire Timed Coding Challenge)
  // =========================================================================
  {
    title: 'CODE SPRINT',
    slug: 'code-sprint',
    description: 'A fast-paced timed programming sprint covering Python, JavaScript, and SQL fundamentals with algorithmic challenges.',
    gameType: 'code-sprint',
    category: 'Programming & Algorithms',
    difficulty: 'Intermediate',
    icon: 'fa-bolt',
    color: '#38bdf8',
    tags: ['Python', 'JavaScript', 'SQL', 'Algorithms'],
    timeLimit: 300, // 5 minutes
    xpReward: 120,
    status: 'active',
    rules: [
      'Answer fast-paced multiple choice and code evaluation questions',
      'Covers Python syntax, JavaScript modern ES6+, and SQL query concepts',
      'Points awarded based on speed, accuracy, and difficulty level',
      'Instant feedback with detailed technical explanations'
    ],
    questions: [
      {
        question: 'In Python, what is the output of: print([i * 2 for i in range(4) if i % 2 == 0])?',
        options: ['[0, 2, 4]', '[0, 4]', '[2, 4, 6]', '[0, 2, 4, 6]'],
        correctAnswer: 1,
        category: 'Python',
        difficulty: 'Beginner',
        level: 1,
        xp: 15,
        explanation: 'range(4) produces 0, 1, 2, 3. The even numbers are 0 and 2. Multiplying by 2 gives [0, 4].'
      },
      {
        question: 'What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?',
        options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
        correctAnswer: 2,
        category: 'Algorithms',
        difficulty: 'Intermediate',
        level: 2,
        xp: 20,
        explanation: 'In a balanced BST, each comparison halves the remaining search space, resulting in logarithmic O(log n) time complexity.'
      },
      {
        question: 'In JavaScript, what does Array.prototype.reduce() return if no initial value is supplied for an array [10, 20, 30]?',
        options: ['undefined', 'TypeError', 'The first element is used as accumulator and iteration starts from index 1', 'Always 0'],
        correctAnswer: 2,
        category: 'JavaScript',
        difficulty: 'Intermediate',
        level: 3,
        xp: 20,
        explanation: 'When initialValue is omitted, reduce() treats index 0 as initial accumulator and begins invoking the callback from index 1.'
      },
      {
        question: 'Which SQL keyword ensures that duplicate rows are eliminated from the query result set?',
        options: ['UNIQUE', 'DISTINCT', 'DIFFERENT', 'ISOLATE'],
        correctAnswer: 1,
        category: 'SQL',
        difficulty: 'Beginner',
        level: 4,
        xp: 15,
        explanation: 'SELECT DISTINCT removes duplicate rows from the query output.'
      },
      {
        question: 'In Java, what will the following output: System.out.println(10 + 20 + "EDUTECH" + 10 + 20); ?',
        options: ['30EDUTECH30', '30EDUTECH1020', '1020EDUTECH1020', 'Compilation Error'],
        correctAnswer: 1,
        category: 'Java',
        difficulty: 'Intermediate',
        level: 5,
        xp: 20,
        explanation: 'Evaluation proceeds left to right: 10 + 20 evaluates to 30. Then 30 + "EDUTECH" performs string concatenation ("30EDUTECH"). Subsequent additions with strings continue concatenation, resulting in "30EDUTECH1020".'
      },
      {
        question: 'In C programming, what will be the output of: int a = 5; printf("%d %d", a++, ++a); (assuming right-to-left evaluation standard in GCC)?',
        options: ['6 7', '6 6', 'Undefined / Compiler-dependent sequence point', '5 7'],
        correctAnswer: 2,
        category: 'C',
        difficulty: 'Advanced',
        level: 6,
        xp: 25,
        explanation: 'Modifying a variable more than once between two sequence points without intervening evaluation produces undefined behavior under the ISO C standard.'
      },
      {
        question: 'In C, what is the value of `sizeof("Hello")` on a standard 64-bit architecture?',
        options: ['5', '6', '8', '4'],
        correctAnswer: 1,
        category: 'C',
        difficulty: 'Beginner',
        level: 7,
        xp: 15,
        explanation: 'The string literal "Hello" in C has 5 characters plus the mandatory terminating null character (\'\\0\'), making its total size 6 bytes.'
      },
      {
        question: 'In Java, what is the result of attempting to compile: `final int x; x = 10; x = 20;` ?',
        options: ['Compiles fine with x = 20', 'Compilation error: variable x might already have been assigned', 'Runtime Exception: FinalModificationException', 'x becomes 10 silently ignoring 20'],
        correctAnswer: 1,
        category: 'Java',
        difficulty: 'Beginner',
        level: 8,
        xp: 15,
        explanation: 'A final variable in Java can only be assigned once. Reassignment results in a compile-time error.'
      },
      {
        question: 'What will be printed by this JavaScript code: console.log(typeof NaN); ?',
        options: ['"undefined"', '"NaN"', '"number"', '"object"'],
        correctAnswer: 2,
        category: 'JavaScript',
        difficulty: 'Beginner',
        level: 9,
        xp: 15,
        explanation: 'In JavaScript specifications (IEEE 754 floating point standard), NaN is classified as a numeric type ("number").'
      },
      {
        question: 'In Python, what happens when you attempt to modify a key in a Dictionary while iterating directly over it?',
        options: ['Memory leak', 'RuntimeError: dictionary changed size during iteration', 'Infinite loop', 'Automatic retry'],
        correctAnswer: 1,
        category: 'Python',
        difficulty: 'Advanced',
        level: 10,
        xp: 25,
        explanation: 'Python raises a RuntimeError if dictionary keys are added or removed during active iteration over the keys view.'
      }
    ]
  },

  // =========================================================================
  // 2. LOGIC MASTER (Reasoning, Patterns, Problem-Solving)
  // =========================================================================
  {
    title: 'LOGIC MASTER',
    slug: 'logic-master',
    description: 'Exercise logical deduction, number sequences, algorithmic puzzles, and mathematical reasoning.',
    gameType: 'logic-master',
    category: 'Logical Reasoning',
    difficulty: 'Intermediate',
    icon: 'fa-puzzle-piece',
    color: '#a855f7',
    tags: ['Patterns', 'Number Series', 'Deduction', 'Math'],
    timeLimit: 480, // 8 minutes
    xpReward: 130,
    status: 'active',
    rules: [
      'Analyze the pattern or logical premise carefully',
      'Use the Hint button if you need conceptual direction',
      'Review the in-depth step-by-step breakdown after submitting each answer'
    ],
    questions: [
      {
        question: 'Find the next number in the sequence: 2, 6, 12, 20, 30, ?',
        options: ['40', '42', '44', '48'],
        correctAnswer: 1,
        hints: ['Notice the difference between consecutive numbers: +4, +6, +8, +10...', 'Alternatively, express each term as n * (n + 1).'],
        category: 'Number Patterns',
        difficulty: 'Beginner',
        level: 1,
        xp: 15,
        explanation: 'Method 1: Differences increase by 2 (+4, +6, +8, +10, +12). 30 + 12 = 42.\nMethod 2: 1*2=2, 2*3=6, 3*4=12, 4*5=20, 5*6=30, 6*7=42.'
      },
      {
        question: 'If all Zips are Zaps, and some Zaps are Zops, which conclusion is strictly valid?',
        options: ['All Zips are Zops', 'Some Zops are definitely Zips', 'Some Zaps are Zips', 'No Zip can be a Zop'],
        correctAnswer: 2,
        hints: ['Consider Venn diagrams where Zips are fully enclosed in Zaps.'],
        category: 'Syllogism',
        difficulty: 'Intermediate',
        level: 2,
        xp: 20,
        explanation: 'Since ALL Zips belong to Zaps, the subset of Zaps that contains Zips guarantees that "Some Zaps are Zips".'
      },
      {
        question: 'What is the missing number in the matrix sequence? [1, 4, 9], [16, 25, 36], [49, 64, ?]',
        options: ['72', '81', '100', '90'],
        correctAnswer: 1,
        hints: ['Each term is a consecutive perfect square: 1^2, 2^2, 3^2, 4^2...'],
        category: 'Pattern Recognition',
        difficulty: 'Beginner',
        level: 3,
        xp: 15,
        explanation: 'The sequence consists of squares of integers from 1 to 9: 1, 4, 9, 16, 25, 36, 49, 64, and 9^2 = 81.'
      },
      {
        question: 'You have 8 balls that look identical. Exactly 1 ball is heavier than the others. What is the minimum number of balance scale weighings needed to guarantee finding the heavy ball?',
        options: ['1', '2', '3', '4'],
        correctAnswer: 1,
        hints: ['Divide the balls into 3 groups: 3, 3, and 2. Weigh the two groups of 3 against each other.'],
        category: 'Algorithmic Deduction',
        difficulty: 'Advanced',
        level: 4,
        xp: 25,
        explanation: 'Weigh 3 balls vs 3 balls. If balanced, the heavy ball is in the remaining 2 (weigh them on 2nd step). If unbalanced, take the heavier 3 balls and weigh 1 vs 1. Thus 2 weighings are sufficient.'
      },
      {
        question: 'Complete the binary logic series: 001, 010, 100, 011, 110, ?',
        options: ['101', '111', '000', '1001'],
        correctAnswer: 0,
        hints: ['Look at decimal equivalents: 1, 2, 4, 3, 6, ? Notice alternating operations *2 then -1.'],
        category: 'Binary & Discrete Math',
        difficulty: 'Intermediate',
        level: 5,
        xp: 20,
        explanation: 'Decimal sequence: 1 (*2) -> 2 (*2) -> 4 (-1) -> 3 (*2) -> 6 (-1) -> 5. 5 in 3-bit binary is 101.'
      },
      {
        question: 'A server rack has 5 lights in a row. Every step, each light toggles its state if its left neighbor was ON in the previous step. If the initial state is [ON, OFF, OFF, OFF, OFF], how many steps until light 3 turns ON?',
        options: ['1 step', '2 steps', '3 steps', '4 steps'],
        correctAnswer: 1,
        hints: ['Simulate the signal propagating one index to the right each clock cycle.'],
        category: 'State Machine Logic',
        difficulty: 'Intermediate',
        level: 6,
        xp: 20,
        explanation: 'Step 0: [1,0,0,0,0]. Step 1: Light 2 checks left (1) -> toggles to ON -> [1,1,0,0,0]. Step 2: Light 3 checks left (1) -> toggles to ON. It takes 2 steps.'
      }
    ]
  },

  // =========================================================================
  // 3. BUG HUNTER (Code Debugging & Defect Identification)
  // =========================================================================
  {
    title: 'BUG HUNTER',
    slug: 'bug-hunter',
    description: 'Analyze real-world Python and JavaScript code snippets with intentional bugs, diagnose the defect, and select the correct fix.',
    gameType: 'bug-hunter',
    category: 'Software Quality & Testing',
    difficulty: 'Intermediate',
    icon: 'fa-crosshairs',
    color: '#f43f5e',
    tags: ['Python', 'JavaScript', 'Defect Analysis', 'Clean Code'],
    timeLimit: 600, // 10 minutes
    xpReward: 140,
    status: 'active',
    rules: [
      'Inspect the highlighted code snippet for syntax, logic, or runtime flaws',
      'Select the exact erroneous line or the correct code replacement',
      'Earn maximum XP by spotting the issue on the first attempt'
    ],
    questions: [
      {
        question: 'Identify the dangerous default parameter bug in this Python function:',
        codeSnippet: 'def add_student(name, students_list=[]):\n    students_list.append(name)\n    return students_list',
        options: [
          'The function name should be uppercase',
          'Default mutable arguments ([] list) are shared across all calls, causing unintended persistence',
          'append() cannot be used inside functions',
          'Python requires return types in function definitions'
        ],
        correctAnswer: 1,
        category: 'Python',
        difficulty: 'Intermediate',
        level: 1,
        xp: 20,
        explanation: 'In Python, default arguments are evaluated once when the function is defined. Passing a mutable default like [] causes state to persist across multiple function invocations. Use `students_list=None` instead.'
      },
      {
        question: 'Find the asynchronous bug in this JavaScript database fetcher:',
        codeSnippet: 'async function fetchUserStats(userId) {\n    const profile = api.getProfile(userId);\n    console.log("User Name:", profile.name);\n    return profile;\n}',
        options: [
          'Missing "await" keyword before api.getProfile(userId)',
          'async functions cannot accept arguments',
          'console.log cannot accept two parameters',
          'profile.name must be called as profile.name()'
        ],
        correctAnswer: 0,
        category: 'JavaScript',
        difficulty: 'Beginner',
        level: 2,
        xp: 15,
        explanation: 'api.getProfile returns a Promise. Without the "await" keyword, profile is a Promise object rather than the resolved data, causing profile.name to evaluate to undefined.'
      },
      {
        question: 'Diagnose the off-by-one bug in this Python array traversal:',
        codeSnippet: 'arr = [10, 20, 30, 40]\nfor i in range(1, len(arr) + 1):\n    print(arr[i])',
        options: [
          'arr is missing parentheses',
          'IndexError: arr[len(arr)] is out of bounds; indexing should be range(len(arr))',
          'len() is not supported on lists in Python',
          'range requires 3 arguments'
        ],
        correctAnswer: 1,
        category: 'Python',
        difficulty: 'Beginner',
        level: 3,
        xp: 15,
        explanation: 'Python lists are 0-indexed (0 to 3). Iterating range(1, len(arr) + 1) misses index 0 and raises an IndexError when accessing arr[4].'
      },
      {
        question: 'Identify why this JavaScript comparison produces an unexpected outcome:',
        codeSnippet: 'const score = "85";\nif (score === 85) {\n    console.log("Distinction");\n}',
        options: [
          'Strict equality (===) checks both value and type; string "85" does not equal number 85',
          'Double quotes are not valid in JavaScript strings',
          'The if condition must use single equals (=)',
          'Constants cannot be evaluated in if statements'
        ],
        correctAnswer: 0,
        category: 'JavaScript',
        difficulty: 'Beginner',
        level: 4,
        xp: 15,
        explanation: 'The strict equality operator (===) performs no type coercion. To fix, parse the string via Number(score) or parseInt(score, 10).'
      },
      {
        question: 'What bug occurs when trying to shallow-copy a nested structure in JavaScript using Object.assign?',
        codeSnippet: 'const original = { user: { name: "Aarav" } };\nconst copy = Object.assign({}, original);\ncopy.user.name = "Bhavna";',
        options: [
          'original.user.name also changes to "Bhavna" because nested objects share the same memory reference',
          'Object.assign throws a TypeError on nested objects',
          'copy becomes an array instead of an object',
          'JavaScript garbage-collects original immediately'
        ],
        correctAnswer: 0,
        category: 'JavaScript',
        difficulty: 'Intermediate',
        level: 5,
        xp: 20,
        explanation: 'Object.assign and spread operator perform a shallow clone. Deeply nested references remain identical. Use structuredClone() for deep copies.'
      },
      {
        question: 'Spot the syntax error in this Python list comprehension:',
        codeSnippet: 'squares = [x**2 for x in numbers if x > 0 else 0]',
        options: [
          'if-else filtering syntax is misplaced; when using "else", the conditional expression must precede the "for" loop',
          '** is not valid exponentiation in Python',
          'squares is a reserved Python keyword',
          'List comprehensions cannot filter with comparison operators'
        ],
        correctAnswer: 0,
        category: 'Python',
        difficulty: 'Advanced',
        level: 6,
        xp: 25,
        explanation: 'In Python list comprehensions: with an "else" branch, use the ternary form before the loop: `[x**2 if x > 0 else 0 for x in numbers]`.'
      }
    ]
  },

  // =========================================================================
  // 4. SQL QUEST (Interactive Query Challenges with Mock Tables)
  // =========================================================================
  {
    title: 'SQL QUEST',
    slug: 'sql-quest',
    description: 'Master enterprise relational database querying with interactive SELECT, WHERE, ORDER BY, GROUP BY, and JOIN challenges evaluated against sandboxed data schemas.',
    gameType: 'sql-quest',
    category: 'Databases & SQL',
    difficulty: 'Intermediate',
    icon: 'fa-database',
    color: '#10b981',
    tags: ['SQL', 'PostgreSQL', 'MySQL', 'Relational Models'],
    timeLimit: 600, // 10 minutes
    xpReward: 150,
    status: 'active',
    rules: [
      'Write or select the correct SQL query matching the target specification',
      'Queries are evaluated against simulated relational table schemas safely without altering production data',
      'Understand relational concepts including primary keys, foreign keys, and aggregation'
    ],
    questions: [
      {
        question: 'Task: Retrieve the name, department, and gpa of all students with GPA greater than 8.0, sorted by GPA descending.',
        category: 'SELECT & WHERE',
        difficulty: 'Beginner',
        level: 1,
        xp: 20,
        sqlScenario: {
          tables: [
            {
              name: 'students',
              columns: ['id', 'name', 'department', 'gpa', 'year'],
              rows: [
                [1, 'Priya Sharma', 'CSE', 8.9, 3],
                [2, 'Arjun Reddy', 'ECE', 7.4, 2],
                [3, 'Meera Nair', 'AI & DS', 9.2, 4],
                [4, 'Rohan Verma', 'IT', 8.1, 3]
              ]
            }
          ],
          expectedColumns: ['name', 'department', 'gpa'],
          expectedRows: [
            ['Meera Nair', 'AI & DS', 9.2],
            ['Priya Sharma', 'CSE', 8.9],
            ['Rohan Verma', 'IT', 8.1]
          ],
          sampleQuery: 'SELECT name, department, gpa FROM students WHERE gpa > 8.0 ORDER BY gpa DESC;'
        },
        options: [
          'SELECT name, department, gpa FROM students WHERE gpa > 8.0 ORDER BY gpa DESC;',
          'SELECT * FROM students WHERE gpa > 8.0 SORT BY gpa DESCENDING;',
          'FIND name, department, gpa IN students FILTER gpa > 8.0;',
          'SELECT name, department, gpa FROM students GROUP BY gpa HAVING gpa > 8.0;'
        ],
        correctAnswer: 0,
        expectedAnswer: 'SELECT name, department, gpa FROM students WHERE gpa > 8.0 ORDER BY gpa DESC;',
        explanation: 'The WHERE clause filters rows where gpa > 8.0, and ORDER BY gpa DESC sorts highest GPA first.'
      },
      {
        question: 'Task: Find the number of registered students in each department from the students table.',
        category: 'GROUP BY & Aggregates',
        difficulty: 'Intermediate',
        level: 2,
        xp: 25,
        sqlScenario: {
          tables: [
            {
              name: 'students',
              columns: ['id', 'name', 'department'],
              rows: [
                [1, 'Aarav', 'CSE'],
                [2, 'Bhavna', 'ECE'],
                [3, 'Chetan', 'CSE'],
                [4, 'Divya', 'IT'],
                [5, 'Esha', 'CSE']
              ]
            }
          ],
          expectedColumns: ['department', 'student_count'],
          expectedRows: [
            ['CSE', 3],
            ['ECE', 1],
            ['IT', 1]
          ],
          sampleQuery: 'SELECT department, COUNT(*) AS student_count FROM students GROUP BY department;'
        },
        options: [
          'SELECT department, COUNT(*) AS student_count FROM students GROUP BY department;',
          'SELECT department, SUM(id) AS student_count FROM students GROUP BY department;',
          'SELECT department, TOTAL(students) FROM students GROUP department;',
          'SELECT department, COUNT(department) FROM students ORDER BY department;'
        ],
        correctAnswer: 0,
        expectedAnswer: 'SELECT department, COUNT(*) AS student_count FROM students GROUP BY department;',
        explanation: 'COUNT(*) calculates the row count per group, and GROUP BY department partitions records by department.'
      },
      {
        question: 'Task: Join students with their course enrollments to display student name and enrolled course title.',
        category: 'INNER JOIN',
        difficulty: 'Intermediate',
        level: 3,
        xp: 25,
        sqlScenario: {
          tables: [
            {
              name: 'students',
              columns: ['id', 'name'],
              rows: [[1, 'Karthi'], [2, 'Maya']]
            },
            {
              name: 'enrollments',
              columns: ['student_id', 'course_title'],
              rows: [[1, 'Full Stack Web'], [1, 'Cloud DevOps'], [2, 'Machine Learning']]
            }
          ],
          expectedColumns: ['name', 'course_title'],
          sampleQuery: 'SELECT s.name, e.course_title FROM students s JOIN enrollments e ON s.id = e.student_id;'
        },
        options: [
          'SELECT s.name, e.course_title FROM students s JOIN enrollments e ON s.id = e.student_id;',
          'SELECT s.name, e.course_title FROM students s MERGE enrollments e WHERE s.id = e.student_id;',
          'SELECT students, enrollments COMBINE ON id = student_id;',
          'SELECT s.name, e.course_title FROM students s, enrollments e;'
        ],
        correctAnswer: 0,
        expectedAnswer: 'SELECT s.name, e.course_title FROM students s JOIN enrollments e ON s.id = e.student_id;',
        explanation: 'An INNER JOIN matches foreign key e.student_id to primary key s.id, combining student names with their respective courses.'
      },
      {
        question: 'Task: Update the status of students in the 4th Year to "Graduated" in the students table.',
        category: 'UPDATE',
        difficulty: 'Beginner',
        level: 4,
        xp: 20,
        options: [
          'UPDATE students SET status = \'Graduated\' WHERE year = \'4th Year\';',
          'ALTER students SET status = \'Graduated\' WHERE year = \'4th Year\';',
          'CHANGE students (status = \'Graduated\') WHEN year = 4;',
          'MODIFY TABLE students VALUES status = \'Graduated\' FOR 4th Year;'
        ],
        correctAnswer: 0,
        expectedAnswer: 'UPDATE students SET status = \'Graduated\' WHERE year = \'4th Year\';',
        explanation: 'UPDATE table SET column = value WHERE condition is standard ANSI SQL syntax for updating table data.'
      },
      {
        question: 'Task: Insert a new internship posting into the internships table with title "Frontend Intern", company "TechCorp", and stipend 20000.',
        category: 'INSERT',
        difficulty: 'Beginner',
        level: 5,
        xp: 20,
        options: [
          'INSERT INTO internships (title, company, stipend) VALUES (\'Frontend Intern\', \'TechCorp\', 20000);',
          'ADD INTO internships SET title=\'Frontend Intern\', company=\'TechCorp\', stipend=20000;',
          'PUT NEW ROW IN internships (\'Frontend Intern\', \'TechCorp\', 20000);',
          'INSERT RECORD TO internships VALUES (\'Frontend Intern\', \'TechCorp\', 20000);'
        ],
        correctAnswer: 0,
        expectedAnswer: 'INSERT INTO internships (title, company, stipend) VALUES (\'Frontend Intern\', \'TechCorp\', 20000);',
        explanation: 'INSERT INTO table_name (columns) VALUES (values) specifies target columns and their corresponding values in SQL.'
      }
    ]
  },

  // =========================================================================
  // 5. AI QUIZ ARENA (Machine Learning, Deep Learning, Generative AI)
  // =========================================================================
  {
    title: 'AI QUIZ ARENA',
    slug: 'ai-arena',
    description: 'Compete in artificial intelligence challenges testing knowledge of Machine Learning, Neural Networks, Transformers, Prompt Engineering, and Large Language Models.',
    gameType: 'ai-arena',
    category: 'Artificial Intelligence',
    difficulty: 'Advanced',
    icon: 'fa-robot',
    color: '#ec4899',
    tags: ['Machine Learning', 'Deep Learning', 'LLMs', 'Generative AI', 'NLP'],
    timeLimit: 420, // 7 minutes
    xpReward: 160,
    status: 'active',
    rules: [
      'Questions cover supervised/unsupervised ML, deep neural nets, and generative transformers',
      'Timed arena mode with dynamic accuracy scoring',
      'Gain advanced AI badges and XP boost upon completion'
    ],
    questions: [
      {
        question: 'What is the primary function of the Self-Attention mechanism in the Transformer architecture?',
        options: [
          'It shrinks the parameter footprint of the model by 90%',
          'It computes weighted relationships between all token pairs in a sequence regardless of distance',
          'It eliminates the need for gradient descent during training',
          'It converts text directly to raw binary audio signals'
        ],
        correctAnswer: 1,
        category: 'Transformers & NLP',
        difficulty: 'Advanced',
        level: 1,
        xp: 25,
        explanation: 'Self-Attention allows every token to attend to all other tokens in the context window, capturing long-range semantic dependencies in parallel without recurrent sequential processing.'
      },
      {
        question: 'Which activation function is most widely used in hidden layers of deep neural networks to alleviate the vanishing gradient problem?',
        options: ['Sigmoid', 'Tanh', 'ReLU (Rectified Linear Unit)', 'Step function'],
        correctAnswer: 2,
        category: 'Deep Learning',
        difficulty: 'Intermediate',
        level: 2,
        xp: 20,
        explanation: 'ReLU outputs f(x) = max(0, x). For positive inputs, its derivative is a constant 1, preventing gradients from exponentially diminishing during backpropagation.'
      },
      {
        question: 'In Large Language Model prompt engineering, what is the effect of lowering the temperature parameter close to 0 (e.g., 0.1)?',
        options: [
          'Responses become more deterministic, focused, and repetitive',
          'Responses become more creative and hallucinated',
          'The model doubles its token output speed',
          'The model disables safety filters'
        ],
        correctAnswer: 0,
        category: 'Generative AI',
        difficulty: 'Beginner',
        level: 3,
        xp: 15,
        explanation: 'Lower temperature sharpens the softmax probability distribution over tokens, making the model consistently pick the highest-likelihood tokens for deterministic output.'
      },
      {
        question: 'When evaluating a cancer diagnosis classification model where missing a positive case is critical, which metric should be prioritized?',
        options: ['Accuracy', 'Precision', 'Recall (Sensitivity)', 'Specificity'],
        correctAnswer: 2,
        category: 'ML Metrics',
        difficulty: 'Intermediate',
        level: 4,
        xp: 20,
        explanation: 'Recall = True Positives / (True Positives + False Negatives). High recall minimizes False Negatives, ensuring that positive cases are not overlooked.'
      },
      {
        question: 'Which technique is used to prevent overfitting in deep learning models by randomly deactivating a subset of neurons during training?',
        options: ['Batch Normalization', 'Dropout', 'Gradient Clipping', 'Data Imputation'],
        correctAnswer: 1,
        category: 'Deep Learning',
        difficulty: 'Intermediate',
        level: 5,
        xp: 20,
        explanation: 'Dropout randomly zeroes out activation units during training iterations, forcing neurons to learn redundant, robust features and preventing co-adaptation.'
      },
      {
        question: 'What technique allows pre-trained foundation models to generate answers referencing private or real-time external documents?',
        options: [
          'RAG (Retrieval-Augmented Generation)',
          'Quantization',
          'Backpropagation',
          'Convolution'
        ],
        correctAnswer: 0,
        category: 'Generative AI',
        difficulty: 'Intermediate',
        level: 6,
        xp: 20,
        explanation: 'RAG retrieves relevant external documents via vector search and injects them into the model prompt as grounding context before generating responses.'
      },
      {
        question: 'Which of the following problems represents Supervised Learning rather than Unsupervised Learning?',
        options: [
          'Predicting house sale prices from labeled historical housing records',
          'Clustering ecommerce customers into unknown persona groups using K-Means',
          'Compressing image dimensionality using PCA without ground truth labels',
          'Market basket association rule mining with Apriori'
        ],
        correctAnswer: 0,
        category: 'Supervised vs Unsupervised',
        difficulty: 'Beginner',
        level: 7,
        xp: 15,
        explanation: 'Supervised learning trains on known input-output pairs with explicit ground-truth labels (such as labeled historical home prices).'
      },
      {
        question: 'What is the fundamental difference between Classification and Regression in machine learning tasks?',
        options: [
          'Classification predicts discrete categorical class labels; Regression predicts continuous numerical quantities',
          'Regression only works on images, whereas classification works on tabular text',
          'Classification requires neural networks, whereas regression cannot use algorithms',
          'There is no difference; both produce continuous probabilities only'
        ],
        correctAnswer: 0,
        category: 'Classification vs Regression',
        difficulty: 'Beginner',
        level: 8,
        xp: 15,
        explanation: 'Classification categorizes data into discrete classes (e.g. Spam / Not Spam), while regression predicts numeric values along a continuum (e.g. salary, temperature).'
      },
      {
        question: 'A machine learning model achieves 99.8% accuracy on training data but drops to 52.1% on unseen validation data. What diagnosis describes this issue?',
        options: [
          'Overfitting (high variance; model memorized training noise rather than generalizing)',
          'Underfitting (high bias; model is too simple to capture patterns)',
          'Zero Gradient problem',
          'Data Imbalance in validation split only'
        ],
        correctAnswer: 0,
        category: 'Model Evaluation',
        difficulty: 'Intermediate',
        level: 9,
        xp: 20,
        explanation: 'A severe discrepancy between outstanding training performance and abysmal validation accuracy is the textbook hallmark of overfitting (high variance).'
      }
    ]
  },

  // =========================================================================
  // 6. MEMORY & PATTERN CHALLENGE (Interactive Visual & Algorithmic Patterns)
  // =========================================================================
  {
    title: 'MEMORY & PATTERN CHALLENGE',
    slug: 'memory-pattern',
    description: 'Test your cognitive memory sequence and algorithmic pattern recognition through progressive interactive rounds.',
    gameType: 'memory-pattern',
    category: 'Cognitive & Pattern Intelligence',
    difficulty: 'Intermediate',
    icon: 'fa-cubes',
    color: '#eab308',
    tags: ['Memory', 'Sequences', 'Visual Patterns', 'Working Memory'],
    timeLimit: 360, // 6 minutes
    xpReward: 120,
    status: 'active',
    rules: [
      'Observe the sequence of flashing sensory nodes or number matrices',
      'Replay the exact sequence in identical order',
      'Each level adds an additional step and accelerates playback speed'
    ],
    questions: [
      {
        question: 'Round 1: Memorize and select the matching 3-step sequence of active grid ports.',
        category: 'Spatial Memory',
        difficulty: 'Beginner',
        level: 1,
        xp: 15,
        options: ['Port Alpha -> Port Beta -> Port Delta', 'Port Beta -> Port Gamma -> Port Alpha', 'Port Gamma -> Port Delta -> Port Beta', 'Port Alpha -> Port Delta -> Port Gamma'],
        correctAnswer: 0,
        explanation: 'The observed sequence illuminated Port Alpha (Node 1), Port Beta (Node 2), then Port Delta (Node 4).'
      },
      {
        question: 'Round 2: Predict the next node in the rotating quadrant pattern: Top-Left (90°), Top-Right (180°), Bottom-Right (270°), ?',
        category: 'Rotational Patterns',
        difficulty: 'Beginner',
        level: 2,
        xp: 15,
        options: ['Bottom-Left (360° / 0°)', 'Top-Left', 'Center', 'Bottom-Right'],
        correctAnswer: 0,
        explanation: 'The pattern rotates clockwise 90 degrees each step through the four quadrants, moving next to Bottom-Left.'
      },
      {
        question: 'Round 3: Identify the missing symbol in the matrix: [■, ▲, ●], [▲, ●, ■], [●, ?, ▲]',
        category: 'Latin Square Matrix',
        difficulty: 'Intermediate',
        level: 3,
        xp: 20,
        options: ['■ (Square)', '▲ (Triangle)', '● (Circle)', '★ (Star)'],
        correctAnswer: 0,
        explanation: 'In this Latin square permutation, each row and column contains exactly one Square, one Triangle, and one Circle. Row 3 is missing the Square.'
      },
      {
        question: 'Round 4: High-speed 5-step sequence verification: Blue(1), Green(2), Red(3), Yellow(4). Sequence observed: 2-4-1-3-2. Which option matches?',
        category: 'Sequential Working Memory',
        difficulty: 'Intermediate',
        level: 4,
        xp: 20,
        options: ['Green -> Yellow -> Blue -> Red -> Green', 'Green -> Blue -> Yellow -> Red -> Green', 'Yellow -> Green -> Blue -> Red -> Yellow', 'Blue -> Green -> Red -> Yellow -> Blue'],
        correctAnswer: 0,
        explanation: 'Mapped to colors: 2 = Green, 4 = Yellow, 1 = Blue, 3 = Red, 2 = Green.'
      },
      {
        question: 'Round 5: Algorithmic Fibonacci pattern recognition: 1, 1, 2, 3, 5, 8, 13, 21, ?',
        category: 'Algorithmic Memory',
        difficulty: 'Intermediate',
        options: ['34', '32', '36', '40'],
        correctAnswer: 0,
        explanation: 'In the Fibonacci sequence, each term is the sum of the preceding two terms: 13 + 21 = 34.'
      }
    ]
  },

  // =========================================================================
  // 6. CYBER DEFENDER (Defensive Cybersecurity, Threat Identification & Safe Practices)
  // =========================================================================
  {
    title: 'CYBER DEFENDER',
    slug: 'cyber-defender',
    description: 'Defend organizational networks and endpoints by identifying phishing attacks, password weaknesses, suspicious links, and security vulnerabilities.',
    gameType: 'cyber-defender',
    category: 'Cybersecurity Education',
    difficulty: 'Intermediate',
    icon: 'fa-shield-halved',
    color: '#10b981',
    tags: ['Cybersecurity', 'Phishing Defense', 'Network Security', 'Authentication', 'Safe Computing'],
    timeLimit: 480, // 8 minutes
    xpReward: 140,
    status: 'active',
    rules: [
      'Examine realistic defensive security scenarios, suspicious emails, and access control policies',
      'Identify critical vulnerabilities and select the appropriate defensive hardening mitigation',
      'Learn core enterprise defense concepts (defense-in-depth, least privilege, zero trust, 2FA)'
    ],
    questions: [
      {
        question: 'Identify the red flag indicating this email is a deceptive phishing message:\n"URGENT: Your account will be suspended in 2 hours! Click http://paypa1-security-verify.net/login immediately to verify your identity."',
        options: [
          'The domain "paypa1-security-verify.net" mimics PayPal with a typo ("1" instead of "l") and creates artificial urgency',
          'It uses the HTTP protocol which is always authorized by major banks',
          'The message gives you 2 hours, which is standard bank grace period policy',
          'The word "URGENT" proves it is signed by a certified administrator'
        ],
        correctAnswer: 0,
        category: 'Phishing Detection',
        difficulty: 'Beginner',
        level: 1,
        xp: 15,
        explanation: 'Typosquatting domains (using "1" instead of "l") and manufactured urgency are classic indicators of social engineering and credential harvesting phishing campaigns.'
      },
      {
        question: 'Which of the following demonstrates the strongest password practice against brute-force and dictionary attacks?',
        options: [
          'Passw0rd2024!',
          'correct-horse-battery-staple-blue9# (28+ character multi-word passphrase with symbols)',
          'qwertyUIOP123',
          'Admin@Corporate1'
        ],
        correctAnswer: 1,
        category: 'Authentication Security',
        difficulty: 'Beginner',
        level: 2,
        xp: 15,
        explanation: 'High entropy through length (20+ character passphrases) renders both offline hash cracking and online dictionary attacks computationally infeasible.'
      },
      {
        question: 'A student receives an SMS with a shortened link: "bit.ly/4xP9qZ - Claim your free laptop now!". What is the safest defensive protocol?',
        options: [
          'Click the link to verify if it asks for a password',
          'Forward it to all friends so they can claim laptops too',
          'Do not click the link; inspect with a URL expander or report to organization security operations',
          'Reply to the SMS asking if the sender is genuine'
        ],
        correctAnswer: 2,
        category: 'Link Analysis',
        difficulty: 'Beginner',
        level: 3,
        xp: 15,
        explanation: 'Smishing attacks use URL shorteners to mask malicious destination endpoints. Never click untrusted shortened links; verify through known legitimate institutional channels.'
      },
      {
        question: 'A web app concatenates unescaped user input directly into an SQL query: `SELECT * FROM users WHERE name = \'\' + input + \'\'`. Which defensive control prevents this vulnerability?',
        options: [
          'Parameterized Queries / Prepared Statements with bound parameters',
          'Increasing the database password length to 64 characters',
          'Disabling all HTTPS SSL certificates on the web server',
          'Installing a desktop antivirus on the user\'s client machine'
        ],
        correctAnswer: 0,
        category: 'Vulnerability Mitigation',
        difficulty: 'Intermediate',
        level: 4,
        xp: 20,
        explanation: 'Parameterized queries ensure the database engine treats input strictly as data literals rather than executable SQL command tokens, mitigating SQL Injection completely.'
      },
      {
        question: 'What is the security principle of "Least Privilege" in enterprise network administration?',
        options: [
          'Every employee is granted Root/Administrator rights to increase productivity',
          'Users and services are granted only the minimum permissions necessary to complete their job duties',
          'All firewall rules are disabled during internal business hours',
          'Employees are allowed to share passwords within the same department'
        ],
        correctAnswer: 1,
        category: 'Access Control',
        difficulty: 'Intermediate',
        level: 5,
        xp: 20,
        explanation: 'The Principle of Least Privilege limits the blast radius of compromised accounts by restricting permissions strictly to required functional tasks.'
      },
      {
        question: 'Which defensive security mechanism requires users to provide two distinct authentication factors (e.g., password + authenticator app TOTP code) before gaining access?',
        options: [
          'Single Sign-On (SSO) without credentials',
          'Multi-Factor Authentication (MFA / 2FA)',
          'Symmetric AES Disk Encryption',
          'Network Address Translation (NAT)'
        ],
        correctAnswer: 1,
        category: 'Authentication Hardening',
        difficulty: 'Intermediate',
        level: 6,
        xp: 20,
        explanation: 'Multi-Factor Authentication combines something you know (password) with something you have (authenticator app OTP / hardware key), stopping 99% of automated credential stuffing attacks.'
      },
      {
        question: 'What type of network security system actively monitors incoming and outgoing traffic to permit or block packets based on defined security rules?',
        options: [
          'Stateful Firewall',
          'Unmanaged Ethernet Switch',
          'DNS Resolver Cache',
          'HDMI Splitter'
        ],
        correctAnswer: 0,
        category: 'Network Defense',
        difficulty: 'Advanced',
        level: 7,
        xp: 25,
        explanation: 'A stateful firewall inspects packet headers and connection states against access control lists (ACLs) to block unauthorized inbound access.'
      },
      {
        question: 'An organization discovers that a company laptop was lost in transit. Which defensive security measure ensures that stored student records cannot be read by an unauthorized finder?',
        options: [
          'Full-Disk Encryption (e.g., BitLocker / FileVault) with strong TPM integration',
          'Changing the desktop wallpaper to a warning banner',
          'Setting the monitor screen sleep timeout to 1 minute',
          'Using incognito mode when browsing the internet'
        ],
        correctAnswer: 0,
        category: 'Data Protection at Rest',
        difficulty: 'Advanced',
        level: 8,
        xp: 25,
        explanation: 'Full-disk encryption renders physical storage completely unreadable without the cryptographic decryption key, ensuring confidentiality even if the physical hardware is stolen.'
      }
    ]
  },

  // =========================================================================
  // 7. NETWORK BUILDER (Computer Networking Fundamentals, Protocols & Topology)
  // =========================================================================
  {
    title: 'NETWORK BUILDER',
    slug: 'network-builder',
    description: 'Solve real-world networking challenges across OSI layers, IP addressing, DNS, TCP/UDP protocols, routing, and network troubleshooting scenarios.',
    gameType: 'network-builder',
    category: 'Computer Networks',
    difficulty: 'Intermediate',
    icon: 'fa-network-wired',
    color: '#8b5cf6',
    tags: ['Networking', 'TCP/IP', 'DNS', 'HTTP/HTTPS', 'Subnetting', 'Routers'],
    timeLimit: 480, // 8 minutes
    xpReward: 140,
    status: 'active',
    rules: [
      'Analyze network device roles, OSI layer functions, and communication flows',
      'Identify protocols (DNS, DHCP, TCP, UDP, HTTPS) and troubleshooting diagnostic tools',
      'Trace packet transmission from client browser to remote server step-by-step'
    ],
    questions: [
      {
        question: 'Which networking device operates primarily at OSI Layer 3 (Network Layer) to inspect IP addresses and forward packets between different subnets?',
        options: [
          'Router',
          'Layer 2 Unmanaged Switch',
          'Repeater / Hub',
          'Ethernet Patch Cable'
        ],
        correctAnswer: 0,
        category: 'Network Devices',
        difficulty: 'Beginner',
        level: 1,
        xp: 15,
        explanation: 'Routers operate at Layer 3 of the OSI model, utilizing IP routing tables to determine optimal paths between disparate network subnets.'
      },
      {
        question: 'Which application layer protocol translates human-readable domain names (e.g. edutechnexus.com) into numerical machine IP addresses (e.g. 192.0.2.1)?',
        options: [
          'DNS (Domain Name System)',
          'DHCP (Dynamic Host Configuration Protocol)',
          'ARP (Address Resolution Protocol)',
          'SNMP (Simple Network Management Protocol)'
        ],
        correctAnswer: 0,
        category: 'Protocols',
        difficulty: 'Beginner',
        level: 2,
        xp: 15,
        explanation: 'DNS functions as the phonebook of the internet, resolving human-friendly domain names to routable IP addresses.'
      },
      {
        question: 'Which protocol provides reliable, connection-oriented data delivery with guaranteed sequencing and 3-way handshake (SYN, SYN-ACK, ACK)?',
        options: [
          'TCP (Transmission Control Protocol)',
          'UDP (User Datagram Protocol)',
          'ICMP (Internet Control Message Protocol)',
          'IGMP (Internet Group Management Protocol)'
        ],
        correctAnswer: 0,
        category: 'Transport Layer',
        difficulty: 'Beginner',
        level: 3,
        xp: 15,
        explanation: 'TCP guarantees ordered, loss-free data transmission through sequence numbers, acknowledgments, and flow control mechanisms.'
      },
      {
        question: 'What is the default subnet mask for a standard IPv4 Class C network represented in CIDR notation as /24?',
        options: [
          '255.255.255.0',
          '255.255.0.0',
          '255.0.0.0',
          '255.255.255.255'
        ],
        correctAnswer: 0,
        category: 'IP Addressing & Subnets',
        difficulty: 'Intermediate',
        level: 4,
        xp: 20,
        explanation: 'A /24 prefix indicates the first 24 bits are set to 1, yielding 255.255.255.0 and leaving 8 bits for host addressing (254 usable hosts).'
      },
      {
        question: 'What security layer does HTTPS add over plain HTTP to ensure data confidentiality and integrity during transmission?',
        options: [
          'TLS/SSL (Transport Layer Security) encryption',
          'A physical fiber optic cable',
          'A proprietary browser toolbar',
          'Automatic JavaScript code compression'
        ],
        correctAnswer: 0,
        category: 'Web Security Protocols',
        difficulty: 'Intermediate',
        level: 5,
        xp: 20,
        explanation: 'HTTPS wraps HTTP inside a TLS (Transport Layer Security) cryptographic tunnel, encrypting traffic and verifying server authenticity via digital certificates.'
      },
      {
        question: 'Arrange the correct sequential steps when a user types "https://example.com" in a web browser:',
        options: [
          '1. DNS Lookup -> 2. TCP 3-Way Handshake -> 3. TLS Handshake -> 4. HTTP GET Request -> 5. HTTP Response 200 OK',
          '1. HTTP Response -> 2. DNS Lookup -> 3. TCP Handshake -> 4. TLS Handshake',
          '1. TLS Handshake -> 2. HTTP GET Request -> 3. DNS Lookup -> 4. TCP Handshake',
          '1. HTTP GET -> 2. ARP Broadcast -> 3. DNS Lookup -> 4. TCP 3-Way Handshake'
        ],
        correctAnswer: 0,
        category: 'Network Communication Flow',
        difficulty: 'Intermediate',
        level: 6,
        xp: 20,
        explanation: 'The browser must first resolve the domain IP via DNS, establish a reliable transport socket with TCP SYN/ACK, negotiate TLS session keys, and then dispatch HTTP requests.'
      },
      {
        question: 'A technician cannot access an external website. Running `ping 8.8.8.8` succeeds, but `ping google.com` fails with "Unknown host". Where is the configuration issue?',
        options: [
          'DNS server settings are misconfigured or unreachable',
          'The computer\'s Network Interface Card (NIC) is physically disconnected',
          'The router has no power',
          'The local IP address has a subnet mask collision'
        ],
        correctAnswer: 0,
        category: 'Network Troubleshooting',
        difficulty: 'Advanced',
        level: 7,
        xp: 25,
        explanation: 'Pinging a raw IP address (8.8.8.8) succeeds, confirming IP routing and gateway connectivity work properly. Failure to resolve "google.com" isolates the issue strictly to DNS resolution.'
      },
      {
        question: 'Which CLI command outputs the hop-by-hop packet path and round-trip latency to a destination host across the internet?',
        options: [
          'traceroute (tracert on Windows)',
          'ipconfig /release',
          'netstat -a',
          'hostname'
        ],
        correctAnswer: 0,
        category: 'Diagnostic Tools',
        difficulty: 'Advanced',
        level: 8,
        xp: 25,
        explanation: 'traceroute (tracert in Windows) increments packet TTL values to discover intermediate routers and analyze latency across network transit paths.'
      }
    ]
  },

  // =========================================================================
  // 8. WEB DESIGN CHALLENGE (Modern CSS, Responsive Layouts, DOM)
  // =========================================================================
  {
    title: 'WEB DESIGN CHALLENGE',
    slug: 'web-design',
    description: 'Solve practical frontend challenges on CSS Grid, Flexbox, responsive breakpoints, DOM events, and modern accessible user interface architecture.',
    gameType: 'web-design',
    category: 'Frontend & UI Engineering',
    difficulty: 'Intermediate',
    icon: 'fa-palette',
    color: '#06b6d4',
    tags: ['HTML5', 'CSS3', 'Flexbox', 'CSS Grid', 'Responsive', 'DOM'],
    timeLimit: 480, // 8 minutes
    xpReward: 130,
    status: 'active',
    rules: [
      'Evaluate modern responsive layout rules, CSS property behaviors, and DOM interactions',
      'Test your understanding of UI/UX best practices and mobile accessibility',
      'Earn frontend mastery badges and instant feedback'
    ],
    questions: [
      {
        question: 'Which CSS Flexbox rule centers child elements along BOTH the main axis and cross axis inside a flex container?',
        options: [
          'justify-content: center; align-items: center;',
          'text-align: center; vertical-align: middle;',
          'float: center; margin: auto;',
          'content-align: center; display: inline;'
        ],
        correctAnswer: 0,
        category: 'CSS Flexbox',
        difficulty: 'Beginner',
        level: 1,
        xp: 15,
        explanation: 'justify-content aligns children on the main axis (horizontal by default), while align-items aligns children on the cross axis (vertical).'
      },
      {
        question: 'How do you create an auto-wrapping, responsive grid in CSS without writing multiple media queries?',
        options: [
          'grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));',
          'grid-columns: responsive;',
          'display: grid-auto-fit 280px;',
          'display: wrap-grid;'
        ],
        correctAnswer: 0,
        category: 'CSS Grid',
        difficulty: 'Intermediate',
        level: 2,
        xp: 20,
        explanation: 'repeat(auto-fit, minmax(280px, 1fr)) dynamically fills the row with columns that are at least 280px and expands them to share remaining space.'
      },
      {
        question: 'In the CSS Box Model, what does `box-sizing: border-box;` accomplish?',
        options: [
          'Padding and borders are included in the element\'s total width and height',
          'It removes borders from the webpage',
          'It forces every element to have a 1px solid border',
          'Width is calculated only from the element\'s content area'
        ],
        correctAnswer: 0,
        category: 'CSS Box Model',
        difficulty: 'Beginner',
        level: 3,
        xp: 15,
        explanation: 'With border-box, the width and height properties include content, padding, and borders, preventing layout blowouts when adding padding.'
      },
      {
        question: 'Which method should be used to listen for click events on elements dynamically added to the DOM after page load?',
        options: [
          'Event Delegation (attach event listener to a static parent container)',
          'window.onload re-attachment loop',
          'onclick attributes in innerHTML',
          'setTimeout 100ms listener poll'
        ],
        correctAnswer: 0,
        category: 'DOM Architecture',
        difficulty: 'Intermediate',
        level: 4,
        xp: 20,
        explanation: 'Event delegation leverages event bubbling by listening on a static parent and checking event.target.closest(), seamlessly handling dynamic children.'
      },
      {
        question: 'Which CSS media query correctly applies styles only when the viewport width is 768px or narrower (tablet & mobile portrait)?',
        options: [
          '@media (max-width: 768px) { ... }',
          '@media screen and (min-width: 768px) { ... }',
          '@viewport (width <= 768px) { ... }',
          '@media mobile-only { ... }'
        ],
        correctAnswer: 0,
        category: 'Responsive Design',
        difficulty: 'Beginner',
        level: 5,
        xp: 15,
        explanation: '@media (max-width: 768px) targets screens whose width is less than or equal to 768 pixels.'
      },
      {
        question: 'Which CSS property enables GPU hardware acceleration for smoother 60fps animations?',
        options: [
          'transform: translate3d(0, 0, 0); or will-change: transform;',
          'filter: gpu(true);',
          'acceleration: 60fps;',
          'display: accelerated-block;'
        ],
        correctAnswer: 0,
        category: 'Performance & Animation',
        difficulty: 'Advanced',
        level: 6,
        xp: 25,
        explanation: 'Using 3D transforms like translate3d() or will-change informs the browser compositor to promote the element to its own GPU render layer.'
      }
    ]
  },

  // =========================================================================
  // 8. TECH QUIZ (Preserved Legacy Game for Full Backward Compatibility)
  // =========================================================================
  {
    title: 'TECH QUIZ',
    slug: 'tech-quiz',
    description: 'Test your knowledge of programming, web development, databases and computer science.',
    gameType: 'quiz',
    category: 'Computer Science',
    difficulty: 'Intermediate',
    icon: 'fa-brain',
    color: '#6c4cff',
    tags: ['HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'SQL', 'Node.js'],
    timeLimit: 600,
    xpReward: 100,
    status: 'active',
    rules: [
      '10 Multiple-choice questions across core full-stack topics',
      'Live countdown timer and dynamic scoring',
      'Earn XP based on your score percentage'
    ],
    questions: [
      {
        question: 'Which HTML element is used to define an internal stylesheet?',
        options: ['<css>', '<script>', '<style>', '<link>'],
        correctAnswer: 2,
        category: 'HTML',
        level: 1,
        xp: 10,
        explanation: 'The <style> tag is used to define internal CSS within an HTML document.'
      },
      {
        question: 'Which CSS property is used to control the space outside an element\'s border?',
        options: ['padding', 'margin', 'border-spacing', 'gap'],
        correctAnswer: 1,
        category: 'CSS',
        level: 2,
        xp: 10,
        explanation: 'Margin creates space around elements outside any defined borders, whereas padding is inside.'
      },
      {
        question: 'Which method converts a JavaScript object into a JSON string format?',
        options: ['JSON.parse()', 'JSON.stringify()', 'JSON.encode()', 'JSON.toObject()'],
        correctAnswer: 1,
        category: 'JavaScript',
        level: 3,
        xp: 10,
        explanation: 'JSON.stringify() converts a JavaScript value or object to a JSON string.'
      },
      {
        question: 'Which built-in Python data structure is ordered, mutable, and defined with square brackets?',
        options: ['Tuple', 'Set', 'List', 'Dictionary'],
        correctAnswer: 2,
        category: 'Python',
        level: 4,
        xp: 10,
        explanation: 'Lists in Python are mutable sequences defined using square brackets [].'
      },
      {
        question: 'Which keyword in Java is used to inherit properties and methods from a superclass?',
        options: ['implements', 'extends', 'inherits', 'super'],
        correctAnswer: 1,
        category: 'Java',
        level: 5,
        xp: 10,
        explanation: 'In Java, the extends keyword indicates that a class is derived from another class.'
      },
      {
        question: 'Which format specifier is used with printf in C to display a signed decimal integer?',
        options: ['%s', '%f', '%d', '%c'],
        correctAnswer: 2,
        category: 'C',
        level: 6,
        xp: 10,
        explanation: '%d (or %i) specifies signed decimal integer output in standard C library I/O.'
      },
      {
        question: 'Which standard stream object is used for reading user console input in C++?',
        options: ['cout', 'cin', 'cerr', 'clog'],
        correctAnswer: 1,
        category: 'C++',
        level: 7,
        xp: 10,
        explanation: 'std::cin is the standard input stream object in C++ header <iostream>.'
      },
      {
        question: 'Which SQL clause is used to filter records and return only those that fulfill a specified condition?',
        options: ['GROUP BY', 'ORDER BY', 'WHERE', 'HAVING'],
        correctAnswer: 2,
        category: 'SQL',
        level: 8,
        xp: 10,
        explanation: 'The WHERE clause in SQL extracts only records that satisfy a specific condition.'
      },
      {
        question: 'In MongoDB, what structure corresponds to a table in a relational database?',
        options: ['Document', 'Schema', 'Collection', 'Database'],
        correctAnswer: 2,
        category: 'MongoDB',
        level: 9,
        xp: 10,
        explanation: 'A Collection in MongoDB is a grouping of MongoDB documents, analogous to a relational table.'
      },
      {
        question: 'Which Node.js core module provides utilities for working with file and directory paths?',
        options: ['fs', 'path', 'url', 'os'],
        correctAnswer: 1,
        category: 'Node.js',
        level: 10,
        xp: 10,
        explanation: 'The path module provides helpful utilities for resolving and manipulating file system paths.'
      }
    ]
  },

  // =========================================================================
  // 9. DEBUGGING GAME (Preserved Legacy Game for Full Backward Compatibility)
  // =========================================================================
  {
    title: 'DEBUGGING GAME',
    slug: 'debugging-game',
    description: 'Find and fix errors in programming code.',
    gameType: 'debugging',
    category: 'Software Engineering',
    difficulty: 'Intermediate',
    icon: 'fa-bug-slash',
    color: '#00d2ff',
    tags: ['HTML', 'CSS', 'JavaScript', 'Python', 'SQL'],
    timeLimit: 900,
    xpReward: 100,
    status: 'active',
    rules: [
      '5 Progressive levels across HTML, CSS, JavaScript, Python, and SQL',
      'Earn XP for each correct level resolved'
    ],
    levels: [
      {
        level: 1,
        category: 'HTML',
        question: 'Find and fix the tag mismatch in this HTML heading snippet.',
        codeSnippet: '<div class="header">\n  <h1>Welcome to EDUTECH Nexus</h>\n</div>',
        buggyToken: '</h>',
        expectedAnswer: '</h1>',
        correctAnswer: '</h1>',
        xp: 20,
        difficulty: 'Beginner',
        explanation: 'The closing tag for <h1> is </h1>, not </h>.'
      },
      {
        level: 2,
        category: 'CSS',
        question: 'Find and fix the misspelled property in this CSS card style.',
        codeSnippet: '.card {\n  display: flex;\n  background-colr: #1e293b;\n  border-radius: 8px;\n}',
        buggyToken: 'background-colr',
        expectedAnswer: 'background-color',
        correctAnswer: 'background-color',
        xp: 20,
        difficulty: 'Beginner',
        explanation: 'The CSS background color property is spelled background-color.'
      },
      {
        level: 3,
        category: 'JavaScript',
        question: 'Find and fix the typo in the JavaScript array property.',
        codeSnippet: 'const numbers = [1, 2, 3, 4];\nconsole.log(numbers.lenght);',
        buggyToken: 'lenght',
        expectedAnswer: 'length',
        correctAnswer: 'length',
        xp: 20,
        difficulty: 'Intermediate',
        explanation: 'The property that returns the number of elements in a JavaScript array is length.'
      },
      {
        level: 4,
        category: 'Python',
        question: 'Find and fix the misspelled function return keyword in Python.',
        codeSnippet: 'def calculate_total(price, tax):\n    total = price + (price * tax)\n    retun total',
        buggyToken: 'retun',
        expectedAnswer: 'return',
        correctAnswer: 'return',
        xp: 20,
        difficulty: 'Intermediate',
        explanation: 'The keyword in Python used to exit a function and pass back an expression is return.'
      },
      {
        level: 5,
        category: 'SQL',
        question: 'Find and fix the syntax error in this SQL query statement.',
        codeSnippet: 'SELEC name, email FROM students WHERE xp > 100;',
        buggyToken: 'SELEC',
        expectedAnswer: 'SELECT',
        correctAnswer: 'SELECT',
        xp: 20,
        difficulty: 'Intermediate',
        explanation: 'The SQL keyword to query data from a database table is SELECT.'
      }
    ]
  }
];

module.exports = gamesData;
