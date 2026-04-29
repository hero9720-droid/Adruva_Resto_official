import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating global_settings table...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS global_settings (
        id INTEGER PRIMARY KEY DEFAULT 1,
        maintenance_mode BOOLEAN DEFAULT false,
        platform_fee_percent DECIMAL(5,2) DEFAULT 0.00,
        support_email TEXT,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Seed initial row
      INSERT INTO global_settings (id, maintenance_mode, platform_fee_percent, support_email)
      VALUES (1, false, 2.50, 'support@adruva.com')
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('✅ global_settings table created and seeded.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
