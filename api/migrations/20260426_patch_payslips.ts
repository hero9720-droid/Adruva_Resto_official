import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Patching payslips table with hours_worked column...');
  try {
    await db.query(`
      ALTER TABLE payslips ADD COLUMN IF NOT EXISTS hours_worked FLOAT DEFAULT 0;
    `);
    console.log('✅ Payslips table patched.');
  } catch (err) {
    console.error('❌ Patch failed:', err);
  } finally {
    process.exit();
  }
}

run();
