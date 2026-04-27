import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Predictive Maintenance & Equipment Health Infrastructure...');
  try {
    await db.query(`
      -- 1. Equipment Registry
      CREATE TABLE IF NOT EXISTS equipment_registry (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(30) NOT NULL, -- 'fridge', 'oven', 'fryer', 'hvac'
        status VARCHAR(20) DEFAULT 'operational', -- 'operational', 'warning', 'down', 'maintenance'
        
        last_maintenance_at TIMESTAMP WITH TIME ZONE,
        next_maintenance_due TIMESTAMP WITH TIME ZONE,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. Telemetry Logs (High frequency metrics)
      CREATE TABLE IF NOT EXISTS equipment_telemetry_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        equipment_id UUID NOT NULL REFERENCES equipment_registry(id) ON DELETE CASCADE,
        metric_name VARCHAR(50) NOT NULL, -- 'temperature', 'power_draw', 'vibration'
        metric_value DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'normal', -- 'normal', 'warning', 'critical'
        logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Maintenance Tickets
      CREATE TABLE IF NOT EXISTS maintenance_tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        equipment_id UUID NOT NULL REFERENCES equipment_registry(id) ON DELETE CASCADE,
        outlet_id UUID NOT NULL REFERENCES outlets(id),
        
        issue_description TEXT,
        scheduled_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed'
        cost_paise BIGINT DEFAULT 0,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_telemetry_equipment_time ON equipment_telemetry_logs(equipment_id, logged_at DESC);
      CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment_registry(outlet_id, status);
    `);
    console.log('✅ Maintenance Intelligence schema deployed.');
  } catch (err) {
    console.error('❌ Maintenance evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
