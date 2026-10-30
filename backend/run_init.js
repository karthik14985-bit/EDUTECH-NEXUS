const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { ensureDefaultAccounts } = require('./services/initDefaults');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/edutech_nexus');
  await ensureDefaultAccounts();
  await mongoose.disconnect();
  console.log('Finished init.');
}

main().catch(console.error);
