import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating dynamic pricing infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pricing_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id),
        name TEXT NOT NULL,
        rule_type TEXT NOT NULL, -- surge, cost_based, time_based, event_based
        target_category_id UUID REFERENCES menu_categories(id),
        target_item_id UUID REFERENCES menu_items(id),
        adjustment_percent FLOAT DEFAULT 0, -- e.g., 10.0 for 10% increase
        start_time TIME,
        end_time TIME,
        min_cost_increase_percent FLOAT, -- for cost_based
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS dynamic_price_paise BIGINT;

      CREATE INDEX IF NOT EXISTS idx_pricing_chain ON pricing_rules(chain_id);
      CREATE INDEX IF NOT EXISTS idx_pricing_active ON pricing_rules(is_active);
    `);
    console.log('✅ Pricing rules table created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
