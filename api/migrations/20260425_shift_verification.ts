import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Adding verification columns to attendance...');
  try {
    await db.query(`
      ALTER TABLE attendance 
      ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES staff(id),
      ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS manager_notes TEXT;
    `);
    console.log('✅ Attendance verification columns added.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
