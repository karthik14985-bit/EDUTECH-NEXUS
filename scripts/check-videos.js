const fs = require('fs');
const path = require('path');

const dirs = [
  './frontend/videos',
  './public/videos',
  './backend/public/videos',
  './backend/uploads'
];

dirs.forEach(d => console.log(d, fs.existsSync(d)));
