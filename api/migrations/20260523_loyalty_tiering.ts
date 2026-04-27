import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Multi-Stage Loyalty Tiering & Automated Progression...');
  try {
    await db.query(`
      -- 1. Loyalty Tier Configurations (Dynamic Rules)
      CREATE TABLE IF NOT EXISTS loyalty_tier_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        tier_name VARCHAR(20) NOT NULL, -- 'bronze', 'silver', 'gold', 'platinum'
        min_spend_paise BIGINT NOT NULL, -- Spend required to reach/maintain
        points_multiplier DECIMAL(3,2) DEFAULT 1.0, -- x1, x1.5, x2 points
        perks_json JSONB DEFAULT '[]', -- List of perks like ['Free Dessert', 'Priority Seating']
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (chain_id, tier_name)
      );

      -- 2. Seed Default Rules for existing chains
      INSERT INTO loyalty_tier_rules (chain_id, tier_name, min_spend_paise, points_multiplier, perks_json)
      SELECT id, 'bronze', 0, 1.0, '["Standard Support"]'::jsonb FROM chains
      ON CONFLICT DO NOTHING;

      INSERT INTO loyalty_tier_rules (chain_id, tier_name, min_spend_paise, points_multiplier, perks_json)
      SELECT id, 'silver', 1000000, 1.25, '["Free Welcome Drink", "5% Bonus Points"]'::jsonb FROM chains
      ON CONFLICT DO NOTHING;

      INSERT INTO loyalty_tier_rules (chain_id, tier_name, min_spend_paise, points_multiplier, perks_json)
      SELECT id, 'gold', 5000000, 1.5, '["Priority Seating", "10% Bonus Points", "Free Birthday Treat"]'::jsonb FROM chains
      ON CONFLICT DO NOTHING;

      INSERT INTO loyalty_tier_rules (chain_id, tier_name, min_spend_paise, points_multiplier, perks_json)
      SELECT id, 'platinum', 20000000, 2.0, '["VIP Table Access", "Personal Concierge", "Exclusive Tasting Events"]'::jsonb FROM chains
      ON CONFLICT DO NOTHING;

      -- 3. Tracking progression
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS tier_evaluation_paise BIGINT DEFAULT 0; -- Spend in current cycle
    `);
    console.log('✅ Multi-Stage Loyalty schema deployed.');
  } catch (err) {
    console.error('❌ Loyalty evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
