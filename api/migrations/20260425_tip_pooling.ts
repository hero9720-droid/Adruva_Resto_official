import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating performance-based tip infrastructure...');
  try {
    await db.query(`
      ALTER TABLE bills 
      ADD COLUMN IF NOT EXISTS tip_amount_paise BIGINT DEFAULT 0;

      CREATE TABLE IF NOT EXISTS tip_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        role_key TEXT NOT NULL, -- waiter, chef, cleaner, etc.
        weight DECIMAL(3,2) NOT NULL DEFAULT 1.0,
        UNIQUE(outlet_id, role_key)
      );

      CREATE TABLE IF NOT EXISTS tip_pools (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        start_date TIMESTAMP WITH TIME ZONE NOT NULL,
        end_date TIMESTAMP WITH TIME ZONE NOT NULL,
        total_amount_paise BIGINT DEFAULT 0,
        status TEXT DEFAULT 'open', -- open, processed
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tip_distributions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pool_id UUID NOT NULL REFERENCES tip_pools(id) ON DELETE CASCADE,
        staff_id UUID NOT NULL REFERENCES staff(id),
        amount_paise BIGINT NOT NULL,
        performance_score DECIMAL(3,2) DEFAULT 1.0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tips_pool ON tip_distributions(pool_id);
      CREATE INDEX IF NOT EXISTS idx_tips_staff ON tip_distributions(staff_id);
    `);

    // Seed default rules for the first outlet
    await db.query(`
      INSERT INTO tip_rules (outlet_id, role_key, weight)
      SELECT id, role, 1.0 FROM outlets CROSS JOIN (VALUES ('waiter'), ('chef'), ('cleaner'), ('manager')) AS t(role)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Tip infrastructure updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
