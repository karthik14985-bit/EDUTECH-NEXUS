const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const serverFile = path.join(root, 'backend', 'server.js');
const frontendDir = path.join(root, 'frontend');

console.log('=== 1. AUDITING BACKEND SERVER.JS ===');
const serverContent = fs.readFileSync(serverFile, 'utf8');
const serverLines = serverContent.split(/\r?\n/);

const routes = [];
serverLines.forEach((line, idx) => {
  const match = line.match(/app\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/);
  if (match) {
    routes.push({ line: idx + 1, method: match[1].toUpperCase(), route: match[2] });
  }
  if (line.includes('// ==') || line.match(/\/\/\s*\d+\./)) {
    console.log(`Section [L${idx+1}]: ${line.trim()}`);
  }
});

console.log('\n--- Discovered Routes (' + routes.length + ') ---');
routes.forEach(r => console.log(`[L${r.line}] ${r.method.padEnd(6)} ${r.route}`));

console.log('\n=== 2. AUDITING FRONTEND PAGES ===');
const frontendFiles = fs.readdirSync(frontendDir);
const htmlFiles = frontendFiles.filter(f => f.endsWith('.html'));
console.log(`Total HTML files: ${htmlFiles.length}`);

const aiReferences = [];
const deadLinks = [];
const apiCalls = new Set();

htmlFiles.forEach(file => {
  const content = fs.readFileSync(path.join(frontendDir, file), 'utf8');
  if (content.toLowerCase().includes('ai mentor') || content.includes('ai-mentor')) {
    aiReferences.push(file);
  }
  // Check href="#"
  const hrefHashes = (content.match(/href=["']#["']/g) || []).length;
  if (hrefHashes > 0) {
    deadLinks.push({ file, count: hrefHashes });
  }
  // Extract api calls if inline
  const matches = content.matchAll(/api\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g);
  for (const m of matches) {
    apiCalls.add(`${m[1].toUpperCase()} ${m[2]}`);
  }
});

console.log('\n--- Files referencing AI Mentor ---');
console.log(aiReferences);

console.log('\n--- Files with href="#" ---');
console.log(deadLinks);

console.log('\n=== 3. AUDITING JS FILES IN FRONTEND ===');
const jsDir = path.join(frontendDir, 'js');
const jsFiles = fs.readdirSync(jsDir);
jsFiles.forEach(file => {
  const content = fs.readFileSync(path.join(jsDir, file), 'utf8');
  if (content.toLowerCase().includes('ai mentor') || content.includes('ai-mentor')) {
    console.log(`Frontend JS with AI Mentor: ${file}`);
  }
  const matches = content.matchAll(/api\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g);
  for (const m of matches) {
    apiCalls.add(`${m[1].toUpperCase()} ${m[2]}`);
  }
});

console.log('\n--- Frontend API Calls Found (' + apiCalls.size + ') ---');
Array.from(apiCalls).sort().forEach(c => console.log(c));
