const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const port = Number(process.env.FRONTEND_PORT || 3000);
const root = path.join(__dirname, 'frontend');
const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime'
};

const backendVideosDir = path.join(__dirname, 'backend', 'uploads', 'course-videos');
const publicVideosDir = path.join(__dirname, 'public', 'videos');

const server = http.createServer((request, response) => {
  const requestedPath = decodeURIComponent(request.url.split('?')[0]);
  let filePath;

  if (requestedPath.startsWith('/uploads/course-videos/')) {
    const filename = path.basename(requestedPath);
    filePath = path.resolve(backendVideosDir, filename);
    if (!filePath.startsWith(backendVideosDir + path.sep)) {
      response.writeHead(403);
      return response.end('Forbidden');
    }
  } else {
    const relativePath = requestedPath === '/' ? '/home.html' : requestedPath;
    filePath = path.resolve(root, `.${relativePath}`);
    if (!filePath.startsWith(root + path.sep)) { response.writeHead(403); return response.end('Forbidden'); }
    if (requestedPath.startsWith('/videos/')) {
      const publicVideoPath = path.resolve(publicVideosDir, `.${requestedPath.slice('/videos'.length)}`);
      if (fs.existsSync(filePath)) {
        // already resolved to frontend/videos file
      } else if (fs.existsSync(publicVideoPath)) {
        filePath = publicVideoPath;
      } else if (requestedPath.startsWith('/videos/uploads/')) {
        const uploadFile = path.resolve(backendVideosDir, path.basename(requestedPath));
        if (uploadFile.startsWith(backendVideosDir + path.sep) && fs.existsSync(uploadFile)) {
          filePath = uploadFile;
        }
      }
    }
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      response.writeHead(err.code === 'ENOENT' ? 404 : 500);
      return response.end(err.code === 'ENOENT' ? 'Not found' : 'Server error');
    }

    if (stats.isDirectory()) {
      response.writeHead(403);
      return response.end('Forbidden');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Handle empty files safely
    if (stats.size === 0) {
      response.writeHead(200, {
        'Content-Length': 0,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes'
      });
      return response.end();
    }

    // Support range requests for video playback
    if (['.mp4', '.webm', '.mov'].includes(ext) && request.headers.range) {
      const range = request.headers.range;
      const match = range.match(/bytes=(\d*)-(\d*)/);
      if (!match) {
        response.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        return response.end('Malformed Range Header');
      }

      let start = match[1] ? parseInt(match[1], 10) : undefined;
      let end = match[2] ? parseInt(match[2], 10) : undefined;

      if (start === undefined && end !== undefined) {
        start = Math.max(0, stats.size - end);
        end = stats.size - 1;
      } else if (start !== undefined && end === undefined) {
        end = stats.size - 1;
      }

      if (isNaN(start) || isNaN(end) || start > end || start >= stats.size || end >= stats.size) {
        response.writeHead(416, { 'Content-Range': `bytes */${stats.size}` });
        return response.end('Range Not Satisfiable');
      }

      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      response.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType
      });
      file.on('error', () => { if (!response.headersSent) response.writeHead(500); response.end(); });
      response.on('close', () => {
        if (!response.writableFinished) file.destroy();
      });
      file.pipe(response);
      return;
    }

    response.writeHead(200, {
      'Content-Length': stats.size,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes'
    });
    const file = fs.createReadStream(filePath);
    file.on('error', () => { if (!response.headersSent) response.writeHead(500); response.end(); });
    response.on('close', () => {
      if (!response.writableFinished) file.destroy();
    });
    file.pipe(response);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend server running: http://localhost:${port}/home.html`);
  console.log(`Admin login: http://localhost:${port}/admin-login.html`);
  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const network of interfaces || []) {
      if (network.family === 'IPv4' && !network.internal) {
        console.log(`Network site: http://${network.address}:${port}/home.html`);
        console.log(`Network admin: http://${network.address}:${port}/admin-login.html`);
      }
    }
  }
});
