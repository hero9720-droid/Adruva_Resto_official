import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Activating AI Core V3: Predictive Inventory & Wastage Prevention...');
  try {
    await db.query(`
      -- 1. Enhanced Expiry Tracking
      ALTER TABLE ingredients 
      ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_perishable BOOLEAN DEFAULT FALSE;

      -- 2. Granular Wastage Logs
      CREATE TABLE IF NOT EXISTS inventory_wastage_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
        quantity DECIMAL(10,3) NOT NULL,
        reason VARCHAR(50) NOT NULL, -- 'expired', 'burnt', 'spilled', 'quality_issue'
        cost_impact_paise INTEGER NOT NULL,
        logged_by UUID REFERENCES staff(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Demand Forecasting Store
      CREATE TABLE IF NOT EXISTS inventory_demand_forecasts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
        predicted_usage_7d DECIMAL(10,3) NOT NULL,
        confidence_score DECIMAL(4,2), -- 0-1
        last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (outlet_id, ingredient_id)
      );

      -- 4. Expiry Batch Tracking (Optional but good for AI)
      CREATE TABLE IF NOT EXISTS ingredient_batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
        quantity DECIMAL(10,3) NOT NULL,
        expiry_date DATE NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ AI Core V3: Predictive Inventory schema deployed.');
  } catch (err) {
    console.error('❌ AI Core V3 evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
