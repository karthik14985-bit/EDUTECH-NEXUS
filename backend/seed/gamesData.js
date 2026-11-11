// EDUTECH NEXUS — Exact 3 Technical Games
// 1. Debugging Challenge (Easy, Medium, Hard - 10 min each, 30 min total)
// 2. Technical Quiz (10 Languages, 10-100 Questions)
// 3. Logic & Coding Challenge (Algorithmic and logical problems)

const gamesData = [
  {
    "title": "Debugging Challenge",
    "slug": "debugging-challenge",
    "description": "Identify and fix bugs across 3 difficulty levels: Easy (10 min), Medium (10 min), and Hard (10 min). Total duration: 30 minutes.",
    "gameType": "debugging",
    "category": "Software Engineering",
    "difficulty": "Intermediate",
    "icon": "fa-bug-slash",
    "color": "#00d2ff",
    "tags": [
      "Debugging",
      "Code Quality",
      "Algorithms",
      "Syntax"
    ],
    "timeLimit": 1800,
    "xpReward": 150,
    "status": "active",
    "rules": [
      "Level 1: Easy (10 Minutes) — Basic syntax and structural bugs",
      "Level 2: Medium (10 Minutes) — Algorithmic logic and data structure bugs",
      "Level 3: Hard (10 Minutes) — Complex state, boundary conditions, and edge cases",
      "Each level has an independent 10-minute countdown timer",
      "Evaluate submitted answers automatically; incorrect answers receive 0 marks",
      "Score is displayed after each level and final score after all 3 levels"
    ],
    "levels": [
      {
        "level": 1,
        "name": "Easy Level",
        "difficulty": "Easy",
        "timeLimit": 600,
        "category": "Syntax & Type Corrections",
        "marks": 100,
        "question": "Fix the syntax error and string concatenation bug in the following function so it correctly returns \"Hello, <name>!\".",
        "codeSnippet": "function greetUser(name) {\n  // BUG: Missing quote and wrong variable casing\n  let message = \"Hello, \" + Name + !;\n  retun message;\n}",
        "starterCode": "function greetUser(name) {\n  let message = \"Hello, \" + name + \"!\";\n  return message;\n}",
        "expectedAnswer": "return \"Hello, \" + name + \"!\";",
        "acceptedFixes": [
          "return \"Hello, \" + name + \"!\";",
          "return 'Hello, ' + name + '!';",
          "return `Hello, ${name}!`;",
          "return message;"
        ],
        "testCases": [
          {
            "input": "\"Alice\"",
            "expectedOutput": "\"Hello, Alice!\"",
            "description": "Greeting Alice"
          },
          {
            "input": "\"Nexus\"",
            "expectedOutput": "\"Hello, Nexus!\"",
            "description": "Greeting Nexus"
          }
        ],
        "explanation": "Fixed the capitalization of name, added quotes around \"!\", and corrected the retun keyword to return."
      },
      {
        "level": 2,
        "name": "Medium Level",
        "difficulty": "Medium",
        "timeLimit": 600,
        "category": "Algorithmic Deduplication & Ordering",
        "marks": 100,
        "question": "The function should remove all duplicate numbers from an array and return the unique numbers in ascending order. Fix the logical errors.",
        "codeSnippet": "function removeDuplicatesAndSort(arr) {\n  // BUG 1: Checks for existence incorrectly\n  // BUG 2: Default Array.sort() sorts lexicographically (10 before 2)\n  let unique = [];\n  for (let i = 0; i <= arr.length; i++) {\n    if (unique.indexOf(arr[i]) === 0) {\n      unique.push(arr[i]);\n    }\n  }\n  return unique.sort();\n}",
        "starterCode": "function removeDuplicatesAndSort(arr) {\n  let unique = [];\n  for (let i = 0; i < arr.length; i++) {\n    if (unique.indexOf(arr[i]) === -1) {\n      unique.push(arr[i]);\n    }\n  }\n  return unique.sort((a, b) => a - b);\n}",
        "expectedAnswer": "return unique.sort((a, b) => a - b);",
        "acceptedFixes": [
          "unique.sort((a, b) => a - b)",
          "return [...new Set(arr)].sort((a, b) => a - b);",
          "unique.indexOf(arr[i]) === -1"
        ],
        "testCases": [
          {
            "input": "[5, 2, 8, 2, 5, 10, 1]",
            "expectedOutput": "[1, 2, 5, 8, 10]",
            "description": "Deduplicates and sorts numerically"
          },
          {
            "input": "[4, 4, 4, 4]",
            "expectedOutput": "[4]",
            "description": "All identical elements"
          }
        ],
        "explanation": "Changed loop condition to i < arr.length, fixed unique.indexOf(arr[i]) === -1, and supplied numeric comparator (a, b) => a - b to sort()."
      },
      {
        "level": 3,
        "name": "Hard Level",
        "difficulty": "Hard",
        "timeLimit": 600,
        "category": "Recursive Inversion & Base Case",
        "marks": 100,
        "question": "The function is intended to recursively find the maximum number in a nested array structure (e.g. [1, [2, [3, 4], 5]]). Fix the missing base condition and comparison logic.",
        "codeSnippet": "function findNestedMax(arr) {\n  // BUG: Causes infinite recursion on non-arrays and fails on negative values\n  let max = -Infinity;\n  for (let item of arr) {\n    if (typeof item === 'object') {\n      let subMax = findNestedMax(item);\n      if (subMax > max) max = subMax;\n    } else {\n      if (item > max) max = item;\n    }\n  }\n  return max;\n}",
        "starterCode": "function findNestedMax(arr) {\n  if (!Array.isArray(arr)) return arr;\n  let max = -Infinity;\n  for (let item of arr) {\n    if (Array.isArray(item)) {\n      let subMax = findNestedMax(item);\n      if (subMax > max) max = subMax;\n    } else if (typeof item === 'number') {\n      if (item > max) max = item;\n    }\n  }\n  return max;\n}",
        "expectedAnswer": "if (Array.isArray(item))",
        "acceptedFixes": [
          "Array.isArray(item)",
          "Array.isArray(arr)",
          "max = Math.max(max, subMax)"
        ],
        "testCases": [
          {
            "input": "[1, [5, [9, 2], 3], 4]",
            "expectedOutput": "9",
            "description": "Deeply nested arrays"
          },
          {
            "input": "[-10, [-5, [-20]], -2]",
            "expectedOutput": "-2",
            "description": "All negative numbers"
          }
        ],
        "explanation": "Used Array.isArray() instead of typeof item === \"object\" which incorrectly matches null and objects, handled empty arrays and numeric validation."
      }
    ]
  },
  {
    "title": "Technical Quiz",
    "slug": "tech-quiz",
    "description": "Language-based programming quiz. Select from 10 programming languages and configure between 10 and 100 questions with randomized options and countdown timer.",
    "gameType": "quiz",
    "category": "Programming & Web Technologies",
    "difficulty": "All Levels",
    "icon": "fa-brain",
    "color": "#a855f7",
    "tags": [
      "Python",
      "Java",
      "C",
      "C++",
      "JavaScript",
      "HTML",
      "CSS",
      "PHP",
      "SQL",
      "C#"
    ],
    "timeLimit": 1200,
    "xpReward": 150,
    "status": "active",
    "rules": [
      "Choose your preferred programming language from the 10 supported languages",
      "Configure the question count from 10 to 100 questions",
      "Four options (A, B, C, D) with randomized correct answer positions",
      "Award marks only for correct answers; incorrect answers receive zero marks",
      "Live progress bar, question counter, and real-time countdown timer",
      "Instant score breakdown and leaderboard recording upon completion"
    ]
  },
  {
    "title": "Logic & Coding Challenge",
    "slug": "code-challenge",
    "description": "Logic-based programming challenges and reasoning problems across Easy, Medium, and Hard tiers. Submit solutions and get automated test validation.",
    "gameType": "code-challenge",
    "category": "Algorithms & Logic",
    "difficulty": "Intermediate",
    "icon": "fa-code",
    "color": "#10b981",
    "tags": [
      "Logic",
      "Algorithms",
      "Data Structures",
      "Problem Solving"
    ],
    "timeLimit": 1200,
    "xpReward": 120,
    "status": "active",
    "rules": [
      "Solve practical algorithmic logic and data structure challenges",
      "Multiple difficulty tiers (Easy, Medium, Hard)",
      "Interactive code editor with pre-filled function signatures",
      "Automated test case runner validates inputs against expected outputs",
      "Full score awarded only when all required test cases pass"
    ],
    "challenges": [
      {
        "id": "two-sum-logic",
        "title": "Target Sum Pair Finder",
        "difficulty": "Easy",
        "marks": 100,
        "description": "Given an array of integers `nums` and an integer `target`, return an array of indices of the two numbers such that they add up to target. Each input has exactly one solution.",
        "starterCode": "function solution(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
        "testCases": [
          {
            "input": "[2, 7, 11, 15], 9",
            "expectedOutput": "[0, 1]",
            "description": "Basic sum pair"
          },
          {
            "input": "[3, 2, 4], 6",
            "expectedOutput": "[1, 2]",
            "description": "Non-consecutive indices"
          },
          {
            "input": "[3, 3], 6",
            "expectedOutput": "[0, 1]",
            "description": "Identical numbers"
          }
        ]
      },
      {
        "id": "valid-parentheses",
        "title": "Balanced Bracket Validator",
        "difficulty": "Medium",
        "marks": 100,
        "description": "Given a string containing just the characters \"(\", \")\", \"{\", \"}\", \"[\" and \"]\", determine if the input string is valid (brackets close in the correct order).",
        "starterCode": "function solution(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (let char of s) {\n    if (char === '(' || char === '{' || char === '[') {\n      stack.push(char);\n    } else if (map[char]) {\n      if (stack.pop() !== map[char]) return false;\n    }\n  }\n  return stack.length === 0;\n}",
        "testCases": [
          {
            "input": "\"()\"",
            "expectedOutput": "true",
            "description": "Single matching pair"
          },
          {
            "input": "\"()[]{}\"",
            "expectedOutput": "true",
            "description": "Multiple sequential pairs"
          },
          {
            "input": "\"(]\"",
            "expectedOutput": "false",
            "description": "Mismatched brackets"
          },
          {
            "input": "\"([)]\"",
            "expectedOutput": "false",
            "description": "Incorrect nesting"
          }
        ]
      },
      {
        "id": "longest-unique-substring",
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "Hard",
        "marks": 100,
        "description": "Given a string `s`, find the length of the longest substring without repeating characters using the sliding window algorithm.",
        "starterCode": "function solution(s) {\n  let maxLength = 0;\n  let start = 0;\n  const seen = new Map();\n  for (let i = 0; i < s.length; i++) {\n    const char = s[i];\n    if (seen.has(char) && seen.get(char) >= start) {\n      start = seen.get(char) + 1;\n    }\n    seen.set(char, i);\n    maxLength = Math.max(maxLength, i - start + 1);\n  }\n  return maxLength;\n}",
        "testCases": [
          {
            "input": "\"abcabcbb\"",
            "expectedOutput": "3",
            "description": "Repeated characters \"abc\""
          },
          {
            "input": "\"bbbbb\"",
            "expectedOutput": "1",
            "description": "All identical characters"
          },
          {
            "input": "\"pwwkew\"",
            "expectedOutput": "3",
            "description": "Substring \"wke\""
          }
        ]
      }
    ]
  }
];

module.exports = gamesData;
