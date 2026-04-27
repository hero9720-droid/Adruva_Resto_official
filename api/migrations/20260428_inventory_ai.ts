import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Deploying AI Inventory Forecasting infrastructure...');
  try {
    await db.query(`
      -- 1. Enhance Ingredients with procurement metadata
      ALTER TABLE ingredients 
      ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS reorder_quantity DECIMAL(10,3) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS shelf_life_days INTEGER;

      -- 2. Create Forecasts table
      CREATE TABLE IF NOT EXISTS inventory_forecasts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id),
        ingredient_id UUID NOT NULL REFERENCES ingredients(id),
        forecast_date DATE NOT NULL,
        predicted_demand DECIMAL(10,3) NOT NULL,
        confidence_score FLOAT DEFAULT 0,
        metadata JSONB DEFAULT '{}', -- { method: 'weighted_ma', trend: 'increasing' }
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (ingredient_id, forecast_date)
      );

      -- 3. Create Daily Consumption Log (Materialized-like table for fast AI access)
      CREATE TABLE IF NOT EXISTS ingredient_consumption_daily (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id),
        ingredient_id UUID NOT NULL REFERENCES ingredients(id),
        log_date DATE NOT NULL,
        quantity_used DECIMAL(10,3) DEFAULT 0,
        UNIQUE (ingredient_id, log_date)
      );

      CREATE INDEX IF NOT EXISTS idx_consumption_date ON ingredient_consumption_daily(log_date);
    `);
    console.log('✅ AI Inventory schema updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
