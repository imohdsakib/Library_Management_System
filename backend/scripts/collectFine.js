#!/usr/bin/env node
require('dotenv').config();
const store = require('../src/lib/mysqlStore');

const id = process.argv[2];
if (!id) {
  console.error('Usage: node scripts/collectFine.js <issueId>');
  process.exit(1);
}

(async () => {
  try {
    await store.initializeDatabase();
    const result = await store.collectFine(id);
    console.log('Result:', result);
    process.exit(0);
  } catch (err) {
    console.error('Error collecting fine:', err && err.stack ? err.stack : err);
    process.exit(2);
  }
})();
