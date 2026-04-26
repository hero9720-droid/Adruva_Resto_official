import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating multi-platform sync infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS external_platforms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        platform_name TEXT NOT NULL, -- zomato, swiggy, magicpin
        is_active BOOLEAN DEFAULT false,
        merchant_id TEXT,
        api_config JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(outlet_id, platform_name)
      );

      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS external_sync_status JSONB DEFAULT '{"zomato": true, "swiggy": true}';

      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS external_platform TEXT,
      ADD COLUMN IF NOT EXISTS external_order_id TEXT,
      ADD COLUMN IF NOT EXISTS external_status TEXT;

      CREATE INDEX IF NOT EXISTS idx_orders_external ON orders(external_order_id);
    `);

    // Seed default platforms for existing outlets
    await db.query(`
      INSERT INTO external_platforms (outlet_id, platform_name)
      SELECT id, p FROM outlets CROSS JOIN (VALUES ('zomato'), ('swiggy')) AS t(p)
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Multi-platform sync infrastructure updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
