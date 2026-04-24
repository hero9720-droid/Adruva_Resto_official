import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const envPath = path.join(__dirname, '../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'PRESENT' : 'MISSING');

async function run() {
  // Dynamic import or require to ensure process.env is set
  const { db } = require('../src/lib/db');
  
  const sqlFile = path.join(__dirname, '../migrations/v5_indexes.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  console.log('Applying performance indexes...');
  try {
    await db.query(sql);
    console.log('Success!');
  } catch (err) {
    console.error('Failed to apply indexes:', err);
  } finally {
    await db.end();
  }
}

run();
