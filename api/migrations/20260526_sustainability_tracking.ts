import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Multi-Unit Waste Management & Sustainability Infrastructure...');
  try {
    await db.query(`
      -- 1. Detailed Waste & Sustainability Logs
      CREATE TABLE IF NOT EXISTS sustainability_waste_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        stock_movement_id UUID REFERENCES stock_movements(id),
        
        -- Category for impact mapping
        item_category VARCHAR(50), -- 'produce', 'meat', 'dairy', 'dry_goods'
        waste_reason VARCHAR(30), -- 'expired', 'spoiled', 'prep_error', 'return'
        
        -- Quantitative Metrics
        quantity DECIMAL(10,3),
        unit VARCHAR(20),
        cost_impact_paise BIGINT,
        
        -- Environmental Impact (Estimated)
        co2_impact_kg DECIMAL(10,2),
        water_impact_liters DECIMAL(10,2),
        
        is_compostable BOOLEAN DEFAULT FALSE,
        is_donatable BOOLEAN DEFAULT FALSE,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. Chain Sustainability Targets
      CREATE TABLE IF NOT EXISTS sustainability_targets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        target_reduction_pct INTEGER DEFAULT 10,
        baseline_period_start DATE,
        baseline_period_end DATE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_waste_outlet_reason ON sustainability_waste_logs(outlet_id, waste_reason);
      CREATE INDEX IF NOT EXISTS idx_waste_created_at ON sustainability_waste_logs(created_at);
    `);
    console.log('✅ Sustainability schema deployed.');
  } catch (err) {
    console.error('❌ Sustainability evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
