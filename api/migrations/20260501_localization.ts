import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Globalizing Adruva Infrastructure...');
  try {
    await db.query(`
      -- 1. Globalization Columns for Chains
      ALTER TABLE chains 
      ADD COLUMN IF NOT EXISTS default_currency VARCHAR(3) DEFAULT 'INR',
      ADD COLUMN IF NOT EXISTS default_timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
      ADD COLUMN IF NOT EXISTS default_locale VARCHAR(10) DEFAULT 'en-IN';

      -- 2. Globalization Columns for Outlets (Overrides)
      ALTER TABLE outlets 
      ADD COLUMN IF NOT EXISTS currency_code VARCHAR(3) DEFAULT 'INR',
      ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
      ADD COLUMN IF NOT EXISTS locale VARCHAR(10) DEFAULT 'en-IN',
      ADD COLUMN IF NOT EXISTS currency_symbol VARCHAR(5) DEFAULT '₹';

      -- 3. Update existing outlets to inherit from chain if needed (simulated)
      UPDATE outlets o
      SET currency_code = c.default_currency,
          timezone = c.default_timezone,
          locale = c.default_locale
      FROM chains c
      WHERE o.chain_id = c.id;

      -- 4. Audit Log for timezone-aware reporting
      -- No schema change needed here, just metadata readiness
    `);
    console.log('✅ Global architecture deployed.');
  } catch (err) {
    console.error('❌ Globalization failed:', err);
  } finally {
    process.exit();
  }
}

run();
