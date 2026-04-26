import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating demand forecasting infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS demand_forecasts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id),
        item_type TEXT NOT NULL, -- menu_item, ingredient
        target_id UUID NOT NULL, -- references menu_items or ingredients
        predicted_date DATE NOT NULL,
        predicted_quantity FLOAT NOT NULL,
        confidence_score FLOAT DEFAULT 0.8,
        analysis_basis TEXT, -- seasonal, trend, moving_average
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_forecast_outlet ON demand_forecasts(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_forecast_date ON demand_forecasts(predicted_date);
    `);
    console.log('✅ Demand forecasting tables created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
