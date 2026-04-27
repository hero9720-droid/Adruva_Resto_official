import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Evolving KDS to V2 (Interactive Command Center)...');
  try {
    await db.query(`
      -- 1. Kitchen Stations
      CREATE TABLE IF NOT EXISTS kitchen_stations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. Link Menu Items to Stations
      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS station_id UUID REFERENCES kitchen_stations(id) ON DELETE SET NULL;

      -- 3. Snap Station to Order Items
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS station_id UUID REFERENCES kitchen_stations(id) ON DELETE SET NULL;

      -- 4. Seed Default Stations
      -- Note: This is an example, real-world would be per-outlet
      INSERT INTO kitchen_stations (outlet_id, name)
      SELECT id, 'Main Kitchen' FROM outlets
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ KDS V2 schema deployed.');
  } catch (err) {
    console.error('❌ KDS evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
