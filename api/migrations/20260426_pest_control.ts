import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating automated pest control infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS pest_control_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
        vendor_name TEXT NOT NULL,
        technician_name TEXT,
        service_date DATE NOT NULL,
        next_service_due DATE,
        chemicals_used TEXT[],
        areas_treated TEXT[],
        certificate_url TEXT,
        observations TEXT,
        is_compliant BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS pest_sensor_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
        sensor_type TEXT NOT NULL, -- trap, bait_station, pheromone
        location TEXT, -- e.g., "Kitchen Main", "Storage Area"
        triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status TEXT DEFAULT 'open', -- open, investigating, resolved
        resolved_at TIMESTAMP WITH TIME ZONE,
        resolution_notes TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_pest_outlet ON pest_control_logs(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_pest_sensor_outlet ON pest_sensor_alerts(outlet_id);
    `);
    console.log('✅ Automated pest control infrastructure updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
