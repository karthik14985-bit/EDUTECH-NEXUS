const fs = require('fs');
const path = require('path');

const dirs = [
  'public/videos/ai',
  'public/videos/python',
  'public/videos/ai-ml',
  'public/videos/fullstack',
  'frontend/videos/ai',
  'frontend/videos/python',
  'frontend/videos/ai-ml',
  'frontend/videos/fullstack'
];

dirs.forEach(d => {
  const fullPath = path.join(__dirname, '..', d);
  fs.mkdirSync(fullPath, { recursive: true });
});

console.log('Video folders initialized without assigning the test fixture to course lessons');
