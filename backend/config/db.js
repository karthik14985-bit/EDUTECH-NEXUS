const mongoose = require('mongoose');

let memoryServerInstance = null;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  const targetUri = process.env.MONGODB_URI;
  let connected = false;

  if (targetUri && !targetUri.includes('YOUR_')) {
    try {
      console.log(`[DB] Attempting to connect to configured MongoDB: ${targetUri.replace(/:[^:]*@/, ':****@')}`);
      await mongoose.connect(targetUri, {
        serverSelectionTimeoutMS: 2500
      });
      console.log(`MongoDB connected: ${mongoose.connection.name}`);
      connected = true;
    } catch (err) {
      console.warn(`[DB] Could not connect to local/configured MongoDB (${err.message}).`);
    }
  }

  if (!connected) {
    try {
      console.log('[DB] Starting embedded MongoMemoryServer for instant zero-config database...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      memoryServerInstance = await MongoMemoryServer.create({
        instance: { dbName: 'edutech_nexus' }
      });
      const memUri = memoryServerInstance.getUri();
      await mongoose.connect(memUri);
      console.log(`[DB] Embedded MongoDB active and connected: ${memUri}`);

      // Auto seed memory database
      try {
        const seed = require('../seed');
        console.log('[DB] Seeding initial courses, lessons, and accounts into memory database...');
        await seed({ exitProcess: false });
        console.log('[DB] Memory database successfully seeded with all curriculum and test accounts.');
      } catch (seedErr) {
        console.warn('[DB] Seeding memory database encountered an error:', seedErr.message);
      }
      connected = true;
    } catch (memErr) {
      console.error('[DB] Failed to start embedded database:', memErr.message);
      throw memErr;
    }
  }

  try {
    const userColl = mongoose.connection.collection('users');
    const indexes = await userColl.indexes();
    for (const idx of indexes) {
      if ((idx.name === 'studentId_1' || idx.name === 'registerNumber_1') && !idx.sparse) {
        console.log(`[DB] Dropping legacy non-sparse index: ${idx.name}`);
        await userColl.dropIndex(idx.name).catch(() => {});
      }
    }
  } catch (_) {}
}

module.exports = connectDatabase;
