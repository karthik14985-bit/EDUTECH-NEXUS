const fs = require('fs');
const path = require('path');
const https = require('https');

const samplePath = path.resolve(__dirname, '..', 'frontend', 'videos', 'sample-lesson.mp4');
const downloadPath = `${samplePath}.download`;

const sampleUrl = 'https://www.w3schools.com/html/mov_bbb.mp4';

async function downloadTestFixture() {
  fs.mkdirSync(path.dirname(samplePath), { recursive: true });

  await new Promise((resolve, reject) => {
    https.get(sampleUrl, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Sample video download returned HTTP ${response.statusCode}`));
        return;
      }

      const file = fs.createWriteStream(downloadPath);
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
      file.on('error', reject);
    }).on('error', reject);
  });

  fs.renameSync(downloadPath, samplePath);
  console.log('Test fixture downloaded to:', samplePath);
}

downloadTestFixture().catch(error => {
  if (fs.existsSync(downloadPath)) fs.unlinkSync(downloadPath);
  console.error('Unable to download test fixture:', error.message);
  process.exitCode = 1;
});
