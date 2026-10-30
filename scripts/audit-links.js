const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const files = fs.readdirSync(frontendDir).filter(f => f.endsWith('.html'));

let issues = 0;
let checked = 0;

files.forEach(f => {
  const content = fs.readFileSync(path.join(frontendDir, f), 'utf8');
  const hrefMatches = content.match(/href=["'][^"']+["']/g) || [];
  hrefMatches.forEach(h => {
    checked++;
    const val = h.replace(/href=["']/, '').slice(0, -1);
    if (val.endsWith('.html') && !val.startsWith('http') && !val.startsWith('/')) {
      const target = val.split('?')[0].split('#')[0];
      if (!fs.existsSync(path.join(frontendDir, target))) {
        console.log(`[DEAD LINK] In ${f}: target "${target}" does not exist`);
        issues++;
      }
    }
  });
});

console.log(`Total HTML files scanned: ${files.length}`);
console.log(`Total links checked: ${checked}`);
console.log(`Dead link issues found: ${issues}`);
