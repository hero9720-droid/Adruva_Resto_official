import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Adding referral columns to customers...');
  try {
    await db.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES customers(id);

      CREATE INDEX IF NOT EXISTS idx_customers_referral_code ON customers(referral_code);
    `);
    console.log('✅ Customer referral columns added.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
