const fs = require('fs');
const lines = fs.readFileSync('backend/server.js', 'utf8').split('\n');
lines.forEach((l, i) => {
  if (l.includes('course') || l.includes('Course') || l.includes('lesson') || l.includes('Lesson')) {
    if (l.includes('app.get') || l.includes('app.post') || l.includes('app.put') || l.includes('app.delete') || l.includes('app.patch') || l.includes('// ===')) {
      console.log((i+1) + ': ' + l.trim());
    }
  }
});

