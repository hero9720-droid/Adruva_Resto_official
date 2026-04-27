import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Intelligent Table Turns & Reservation AI Infrastructure...');
  try {
    await db.query(`
      -- 1. Table Availability Intelligence
      ALTER TABLE tables 
      ADD COLUMN IF NOT EXISTS predicted_available_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS turn_time_minutes INTEGER DEFAULT 60;

      -- 2. VIP & Smart Reservation Enhancements
      ALTER TABLE reservations 
      ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS confirmation_code VARCHAR(10),
      ADD COLUMN IF NOT EXISTS party_notes TEXT;

      -- 3. Table Session Analytics
      ALTER TABLE table_sessions 
      ADD COLUMN IF NOT EXISTS predicted_duration_minutes INTEGER,
      ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE;

      -- 4. Occupancy Heatmap Logs
      CREATE TABLE IF NOT EXISTS occupancy_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        occupied_tables INTEGER NOT NULL,
        total_tables INTEGER NOT NULL,
        waiting_parties INTEGER DEFAULT 0
      );

      -- 5. VIP Guest Alerts
      CREATE TABLE IF NOT EXISTS vip_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Intelligent Table Turns & AI schema deployed.');
  } catch (err) {
    console.error('❌ Table intelligence evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
