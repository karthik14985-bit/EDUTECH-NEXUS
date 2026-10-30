const fs = require('fs');
const code = fs.readFileSync('./backend/server.js', 'utf8');
console.log('mongoose in server.js:', code.includes("require('mongoose')") || code.includes('require("mongoose")'));
const matches = code.matchAll(/mongoose\.[A-Za-z0-9_.]+/g);
for (const m of matches) {
  console.log('Used mongoose call:', m[0]);
}
