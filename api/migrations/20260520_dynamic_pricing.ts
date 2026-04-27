import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating AI-Driven Dynamic Menu Pricing Infrastructure...');
  try {
    await db.query(`
      -- 1. Dynamic Pricing Rule Definitions
      CREATE TABLE IF NOT EXISTS dynamic_pricing_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(30) NOT NULL, -- 'surge' (demand), 'cost_plus' (margin), 'scarcity' (stock)
        multiplier DECIMAL(4,2) DEFAULT 1.0,
        start_time TIME,
        end_time TIME,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. Menu Item Pricing Guardrails
      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS is_dynamic_pricing BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS dynamic_min_price_paise INTEGER,
      ADD COLUMN IF NOT EXISTS dynamic_max_price_paise INTEGER,
      ADD COLUMN IF NOT EXISTS last_price_update_at TIMESTAMP WITH TIME ZONE;

      -- 3. Price History Logs
      CREATE TABLE IF NOT EXISTS menu_price_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        old_price_paise INTEGER NOT NULL,
        new_price_paise INTEGER NOT NULL,
        reason VARCHAR(100), -- 'surge_active', 'cost_spike', 'manual_reset'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 4. Seed basic Surge Rule (7pm - 10pm, 1.2x multiplier)
      INSERT INTO dynamic_pricing_rules (outlet_id, name, type, multiplier, start_time, end_time)
      SELECT id, 'Dinner Surge', 'surge', 1.2, '19:00:00', '22:00:00' FROM outlets
      ON CONFLICT DO NOTHING;

      CREATE INDEX IF NOT EXISTS idx_price_logs_item ON menu_price_logs(menu_item_id, created_at DESC);
    `);
    console.log('✅ Dynamic Pricing schema deployed.');
  } catch (err) {
    console.error('❌ Pricing evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
