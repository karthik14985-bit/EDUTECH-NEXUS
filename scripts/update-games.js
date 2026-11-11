const fs = require('fs');
const path = require('path');

const gamesDataPath = path.join(__dirname, '..', 'backend', 'seed', 'gamesData.js');

// 1. GAME 1: DEBUGGING CHALLENGE (3 Levels: Easy, Medium, Hard - 10 mins each = 30 mins total)
const debuggingGame = {
  title: 'Debugging Challenge',
  slug: 'debugging-challenge',
  description: 'Identify and fix bugs across 3 difficulty levels: Easy (10 min), Medium (10 min), and Hard (10 min). Total duration: 30 minutes.',
  gameType: 'debugging',
  category: 'Software Engineering',
  difficulty: 'Intermediate',
  icon: 'fa-bug-slash',
  color: '#00d2ff',
  tags: ['Debugging', 'Code Quality', 'Algorithms', 'Syntax'],
  timeLimit: 1800, // 30 minutes total
  xpReward: 150,
  status: 'active',
  rules: [
    'Level 1: Easy (10 Minutes) — Basic syntax and structural bugs',
    'Level 2: Medium (10 Minutes) — Algorithmic logic and data structure bugs',
    'Level 3: Hard (10 Minutes) — Complex state, boundary conditions, and edge cases',
    'Each level has an independent 10-minute countdown timer',
    'Evaluate submitted answers automatically; incorrect answers receive 0 marks',
    'Score is displayed after each level and final score after all 3 levels'
  ],
  levels: [
    {
      level: 1,
      name: 'Easy Level',
      difficulty: 'Easy',
      timeLimit: 600, // 10 mins
      category: 'Syntax & Type Corrections',
      marks: 100,
      question: 'Fix the syntax error and string concatenation bug in the following function so it correctly returns "Hello, <name>!".',
      codeSnippet: `function greetUser(name) {
  // BUG: Missing quote and wrong variable casing
  let message = "Hello, " + Name + !;
  retun message;
}`,
      starterCode: `function greetUser(name) {
  let message = "Hello, " + name + "!";
  return message;
}`,
      expectedAnswer: 'return "Hello, " + name + "!";',
      acceptedFixes: [
        'return "Hello, " + name + "!";',
        "return 'Hello, ' + name + '!';",
        'return `Hello, ${name}!`;',
        'return message;'
      ],
      testCases: [
        { input: '"Alice"', expectedOutput: '"Hello, Alice!"', description: 'Greeting Alice' },
        { input: '"Nexus"', expectedOutput: '"Hello, Nexus!"', description: 'Greeting Nexus' }
      ],
      explanation: 'Fixed the capitalization of name, added quotes around "!", and corrected the retun keyword to return.'
    },
    {
      level: 2,
      name: 'Medium Level',
      difficulty: 'Medium',
      timeLimit: 600, // 10 mins
      category: 'Algorithmic Deduplication & Ordering',
      marks: 100,
      question: 'The function should remove all duplicate numbers from an array and return the unique numbers in ascending order. Fix the logical errors.',
      codeSnippet: `function removeDuplicatesAndSort(arr) {
  // BUG 1: Checks for existence incorrectly
  // BUG 2: Default Array.sort() sorts lexicographically (10 before 2)
  let unique = [];
  for (let i = 0; i <= arr.length; i++) {
    if (unique.indexOf(arr[i]) === 0) {
      unique.push(arr[i]);
    }
  }
  return unique.sort();
}`,
      starterCode: `function removeDuplicatesAndSort(arr) {
  let unique = [];
  for (let i = 0; i < arr.length; i++) {
    if (unique.indexOf(arr[i]) === -1) {
      unique.push(arr[i]);
    }
  }
  return unique.sort((a, b) => a - b);
}`,
      expectedAnswer: 'return unique.sort((a, b) => a - b);',
      acceptedFixes: [
        'unique.sort((a, b) => a - b)',
        'return [...new Set(arr)].sort((a, b) => a - b);',
        'unique.indexOf(arr[i]) === -1'
      ],
      testCases: [
        { input: '[5, 2, 8, 2, 5, 10, 1]', expectedOutput: '[1, 2, 5, 8, 10]', description: 'Deduplicates and sorts numerically' },
        { input: '[4, 4, 4, 4]', expectedOutput: '[4]', description: 'All identical elements' }
      ],
      explanation: 'Changed loop condition to i < arr.length, fixed unique.indexOf(arr[i]) === -1, and supplied numeric comparator (a, b) => a - b to sort().'
    },
    {
      level: 3,
      name: 'Hard Level',
      difficulty: 'Hard',
      timeLimit: 600, // 10 mins
      category: 'Recursive Inversion & Base Case',
      marks: 100,
      question: 'The function is intended to recursively find the maximum number in a nested array structure (e.g. [1, [2, [3, 4], 5]]). Fix the missing base condition and comparison logic.',
      codeSnippet: `function findNestedMax(arr) {
  // BUG: Causes infinite recursion on non-arrays and fails on negative values
  let max = -Infinity;
  for (let item of arr) {
    if (typeof item === 'object') {
      let subMax = findNestedMax(item);
      if (subMax > max) max = subMax;
    } else {
      if (item > max) max = item;
    }
  }
  return max;
}`,
      starterCode: `function findNestedMax(arr) {
  if (!Array.isArray(arr)) return arr;
  let max = -Infinity;
  for (let item of arr) {
    if (Array.isArray(item)) {
      let subMax = findNestedMax(item);
      if (subMax > max) max = subMax;
    } else if (typeof item === 'number') {
      if (item > max) max = item;
    }
  }
  return max;
}`,
      expectedAnswer: 'if (Array.isArray(item))',
      acceptedFixes: [
        'Array.isArray(item)',
        'Array.isArray(arr)',
        'max = Math.max(max, subMax)'
      ],
      testCases: [
        { input: '[1, [5, [9, 2], 3], 4]', expectedOutput: '9', description: 'Deeply nested arrays' },
        { input: '[-10, [-5, [-20]], -2]', expectedOutput: '-2', description: 'All negative numbers' }
      ],
      explanation: 'Used Array.isArray() instead of typeof item === "object" which incorrectly matches null and objects, handled empty arrays and numeric validation.'
    }
  ]
};

// 2. GAME 2: TECHNICAL QUIZ (Supports 10 Languages: Python, Java, C, C++, JavaScript, HTML, CSS, PHP, SQL, C#; 10 to 100 questions)
const technicalQuizGame = {
  title: 'Technical Quiz',
  slug: 'tech-quiz',
  description: 'Language-based programming quiz. Select from 10 programming languages and configure between 10 and 100 questions with randomized options and countdown timer.',
  gameType: 'quiz',
  category: 'Programming & Web Technologies',
  difficulty: 'All Levels',
  icon: 'fa-brain',
  color: '#a855f7',
  tags: ['Python', 'Java', 'C', 'C++', 'JavaScript', 'HTML', 'CSS', 'PHP', 'SQL', 'C#'],
  timeLimit: 1200,
  xpReward: 150,
  status: 'active',
  rules: [
    'Choose your preferred programming language from the 10 supported languages',
    'Configure the question count from 10 to 100 questions',
    'Four options (A, B, C, D) with randomized correct answer positions',
    'Award marks only for correct answers; incorrect answers receive zero marks',
    'Live progress bar, question counter, and real-time countdown timer',
    'Instant score breakdown and leaderboard recording upon completion'
  ]
};

// 3. GAME 3: LOGIC & CODING CHALLENGE (Algorithmic reasoning and problem solving)
const codeChallengeGame = {
  title: 'Logic & Coding Challenge',
  slug: 'code-challenge',
  description: 'Logic-based programming challenges and reasoning problems across Easy, Medium, and Hard tiers. Submit solutions and get automated test validation.',
  gameType: 'code-challenge',
  category: 'Algorithms & Logic',
  difficulty: 'Intermediate',
  icon: 'fa-code',
  color: '#10b981',
  tags: ['Logic', 'Algorithms', 'Data Structures', 'Problem Solving'],
  timeLimit: 1200,
  xpReward: 120,
  status: 'active',
  rules: [
    'Solve practical algorithmic logic and data structure challenges',
    'Multiple difficulty tiers (Easy, Medium, Hard)',
    'Interactive code editor with pre-filled function signatures',
    'Automated test case runner validates inputs against expected outputs',
    'Full score awarded only when all required test cases pass'
  ],
  challenges: [
    {
      id: 'two-sum-logic',
      title: 'Target Sum Pair Finder',
      difficulty: 'Easy',
      marks: 100,
      description: 'Given an array of integers `nums` and an integer `target`, return an array of indices of the two numbers such that they add up to target. Each input has exactly one solution.',
      starterCode: `function solution(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      testCases: [
        { input: '[2, 7, 11, 15], 9', expectedOutput: '[0, 1]', description: 'Basic sum pair' },
        { input: '[3, 2, 4], 6', expectedOutput: '[1, 2]', description: 'Non-consecutive indices' },
        { input: '[3, 3], 6', expectedOutput: '[0, 1]', description: 'Identical numbers' }
      ]
    },
    {
      id: 'valid-parentheses',
      title: 'Balanced Bracket Validator',
      difficulty: 'Medium',
      marks: 100,
      description: 'Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid (brackets close in the correct order).',
      starterCode: `function solution(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (let char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`,
      testCases: [
        { input: '"()"', expectedOutput: 'true', description: 'Single matching pair' },
        { input: '"()[]{}"', expectedOutput: 'true', description: 'Multiple sequential pairs' },
        { input: '"(]"', expectedOutput: 'false', description: 'Mismatched brackets' },
        { input: '"([)]"', expectedOutput: 'false', description: 'Incorrect nesting' }
      ]
    },
    {
      id: 'longest-unique-substring',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'Hard',
      marks: 100,
      description: 'Given a string `s`, find the length of the longest substring without repeating characters using the sliding window algorithm.',
      starterCode: `function solution(s) {
  let maxLength = 0;
  let start = 0;
  const seen = new Map();
  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (seen.has(char) && seen.get(char) >= start) {
      start = seen.get(char) + 1;
    }
    seen.set(char, i);
    maxLength = Math.max(maxLength, i - start + 1);
  }
  return maxLength;
}`,
      testCases: [
        { input: '"abcabcbb"', expectedOutput: '3', description: 'Repeated characters "abc"' },
        { input: '"bbbbb"', expectedOutput: '1', description: 'All identical characters' },
        { input: '"pwwkew"', expectedOutput: '3', description: 'Substring "wke"' }
      ]
    }
  ]
};

const gamesData = [
  debuggingGame,
  technicalQuizGame,
  codeChallengeGame
];

const fileContent = `// EDUTECH NEXUS — Exact 3 Technical Games
// 1. Debugging Challenge (Easy, Medium, Hard - 10 min each, 30 min total)
// 2. Technical Quiz (10 Languages, 10-100 Questions)
// 3. Logic & Coding Challenge (Algorithmic and logical problems)

const gamesData = ${JSON.stringify(gamesData, null, 2)};

module.exports = gamesData;
`;

fs.writeFileSync(gamesDataPath, fileContent, 'utf8');
console.log(`Successfully updated exact 3 games in ${gamesDataPath}`);

