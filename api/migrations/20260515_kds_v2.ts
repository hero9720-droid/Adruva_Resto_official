import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Advanced Kitchen Display System (KDS) V2 Infrastructure...');
  try {
    await db.query(`
      -- 1. Precision Prep Timing
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS prep_started_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS prep_completed_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS target_prep_time_minutes INTEGER DEFAULT 15,
      ADD COLUMN IF NOT EXISTS is_priority BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS station_id UUID; -- Link to specific physical KDS station

      -- 2. KDS Station Metrics
      CREATE TABLE IF NOT EXISTS kds_performance_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        station_name VARCHAR(50) NOT NULL, -- 'Main Kitchen', 'Bar', 'Grill'
        order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
        prep_time_seconds INTEGER,
        is_over_target BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Load Balancing Configuration
      ALTER TABLE outlets 
      ADD COLUMN IF NOT EXISTS kds_config JSONB DEFAULT '{
        "alert_threshold_minutes": 20,
        "auto_bump_enabled": false,
        "station_routing": "category_based"
      }';

      -- 4. Station Routing Map
      CREATE TABLE IF NOT EXISTS kds_stations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ KDS V2 schema deployed.');
  } catch (err) {
    console.error('❌ KDS evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
