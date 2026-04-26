import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating delivery hub infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS delivery_platforms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id),
        name TEXT NOT NULL, -- Zomato, Swiggy, UberEats, MagicPin
        commission_percent FLOAT DEFAULT 0,
        api_key TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE orders 
      ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'pos', -- pos, web, delivery
      ADD COLUMN IF NOT EXISTS delivery_platform_id UUID REFERENCES delivery_platforms(id),
      ADD COLUMN IF NOT EXISTS external_order_id TEXT, -- platform's order #
      ADD COLUMN IF NOT EXISTS platform_commission_paise BIGINT DEFAULT 0;

      CREATE INDEX IF NOT EXISTS idx_orders_source ON orders(source);
      CREATE INDEX IF NOT EXISTS idx_orders_external_id ON orders(external_order_id);
    `);
    console.log('✅ Delivery Hub tables and columns created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
