const fs = require('fs');
const path = require('path');

const videoDir = path.resolve(__dirname, '..', 'frontend', 'videos');
const uploadDir = path.resolve(videoDir, 'uploads');
const course1Dir = path.resolve(videoDir, 'course1');

[videoDir, uploadDir, course1Dir].forEach(d => {
  if (!fs.existsSync(d)) {
    fs.mkdirSync(d, { recursive: true });
    console.log('Created directory:', d);
  }
});
