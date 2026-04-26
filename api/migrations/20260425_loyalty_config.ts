import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Adding loyalty_config to chains...');
  try {
    await db.query(`
      ALTER TABLE chains 
      ADD COLUMN IF NOT EXISTS loyalty_config JSONB 
      DEFAULT '{"points_to_paise": 100, "max_redemption_percent": 50}'::jsonb;
    `);
    console.log('✅ Loyalty config column added successfully.');
  } catch (err) {
    console.error('❌ Failed:', err);
  } finally {
    process.exit();
  }
}

run();
