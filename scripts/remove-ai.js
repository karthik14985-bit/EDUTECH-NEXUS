const fs = require('fs');
const path = require('path');

const filesToDelete = [
  'frontend/ai-mentor.html',
  'frontend/admin-ai-mentor.html',
  'frontend/js/ai-mentor.js',
  'frontend/css/ai-mentor.css',
  'backend/routes/aiRoutes.js',
  'backend/controllers/aiController.js',
  'backend/models/AIConversation.js',
  'backend/services/aiService.js'
];

filesToDelete.forEach(file => {
  const fullPath = path.resolve(__dirname, '..', file);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log('Deleted successfully:', file);
  } else {
    console.log('File does not exist (already gone):', file);
  }
});
