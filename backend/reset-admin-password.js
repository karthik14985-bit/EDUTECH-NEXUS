const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { emitKeypressEvents } = require('readline');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');

const envPath = path.join(__dirname, '.env');
const inheritedAdminPassword = process.env.ADMIN_PASSWORD;
require('dotenv').config({ path: envPath });
const adminEmail = String(process.env.ADMIN_EMAIL || 'adminedutech001@gmail.com').trim().toLowerCase();
const adminUsername = 'admin';

function readHidden(label) {
  if (!process.stdin.isTTY || typeof process.stdin.setRawMode !== 'function') {
    throw new Error('Run this command in an interactive terminal so the new password is not echoed.');
  }

  return new Promise((resolve, reject) => {
    const input = process.stdin;
    const output = process.stdout;
    emitKeypressEvents(input);
    input.setRawMode(true);
    input.resume();
    output.write(`${label}: `);

    let value = '';
    const cleanup = () => {
      input.off('keypress', onKeypress);
      input.setRawMode(false);
      input.pause();
      output.write('\n');
    };
    const onKeypress = (character, key = {}) => {
      if (key.ctrl && key.name === 'c') {
        cleanup();
        reject(new Error('Password reset cancelled.'));
        return;
      }
      if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        resolve(value);
        return;
      }
      if (key.name === 'backspace') {
        if (value.length) {
          value = value.slice(0, -1);
          output.write('\b \b');
        }
        return;
      }
      if (character && !key.ctrl && !key.meta && value.length < 128) {
        value += character;
        output.write('*');
      }
    };

    input.on('keypress', onKeypress);
  });
}

function savePasswordToEnv(password) {
  let contents = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
  const escapedPassword = password.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const setting = `ADMIN_PASSWORD="${escapedPassword}"`;
  const lines = contents.split(/\r?\n/);
  let replaced = false;

  contents = lines.filter(line => {
    if (/^\s*ADMIN_PASSWORD\s*=/.test(line)) {
      if (replaced) return false;
      replaced = true;
      return true;
    }
    return true;
  }).map(line => /^\s*ADMIN_PASSWORD\s*=/.test(line) ? setting : line).join('\n');

  if (!replaced) {
    contents = `${contents.replace(/\n*$/, '')}\n${setting}\n`;
  } else if (!contents.endsWith('\n')) {
    contents += '\n';
  }

  const tempPath = `${envPath}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tempPath, contents, { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(tempPath, envPath);
  } catch (error) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    throw new Error(`Unable to save the local password setting: ${error.message}`);
  }
  process.env.ADMIN_PASSWORD = password;
}

async function resetAdminPassword() {
  if (inheritedAdminPassword !== undefined) {
    throw new Error('ADMIN_PASSWORD is set in the process environment and can override backend/.env. Remove it from this shell, then rerun the reset command.');
  }
  if (!process.env.MONGODB_URI || process.env.MONGODB_URI.includes('YOUR_')) {
    throw new Error('Set a real MONGODB_URI in backend/.env before resetting the admin password.');
  }

  const firstPassword = await readHidden('New admin password (12+ characters, max 72 UTF-8 bytes)');
  if (firstPassword.length < 12 || firstPassword.length > 128 || Buffer.byteLength(firstPassword, 'utf8') > 72 || /[\r\n]/.test(firstPassword)) {
    throw new Error('Use at least 12 characters and no more than 72 UTF-8 bytes, without line breaks.');
  }
  const confirmedPassword = await readHidden('Confirm new admin password');
  if (firstPassword !== confirmedPassword) {
    throw new Error('The passwords do not match. No changes were made.');
  }

  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });

  const admin = await User.findOne({
    email: adminEmail,
    username: adminUsername,
    role: 'admin'
  }).select('_id email username role +password');

  if (!admin) {
    throw new Error('The configured admin account was not found. No user was created or modified.');
  }

  const passwordHash = await bcrypt.hash(firstPassword, 12);
  const target = { _id: admin._id, email: adminEmail, username: adminUsername, role: 'admin' };
  try {
    const update = await User.updateOne(target, { $set: { password: passwordHash } });
    if (update.matchedCount !== 1 || update.modifiedCount !== 1) {
      throw new Error('The intended admin record was not updated.');
    }

    const verifiedAdmin = await User.findById(admin._id).select('+password');
    if (!verifiedAdmin || !(await bcrypt.compare(firstPassword, verifiedAdmin.password))) {
      throw new Error('Password update could not be verified.');
    }

    savePasswordToEnv(firstPassword);
  } catch (error) {
    try {
      await User.updateOne(target, { $set: { password: admin.password } });
    } catch (restoreError) {
      throw new Error(`${error.message} The previous password hash could not be restored; check the database before restarting the backend.`);
    }
    throw error;
  }

  console.log(`Admin password updated and verified for ${admin.email} (username: ${admin.username}).`);
  console.log('The password is stored in backend/.env and hashed in MongoDB. It was not printed.');
}

resetAdminPassword()
  .catch(error => {
    console.error(`Admin password reset failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) await mongoose.disconnect();
  });
