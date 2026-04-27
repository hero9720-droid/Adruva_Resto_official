import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Employee Duty Cycles & Biometric Sync Infrastructure...');
  try {
    await db.query(`
      -- 1. Enhanced Shift Definitions
      ALTER TABLE shifts 
      ADD COLUMN IF NOT EXISTS name VARCHAR(50) DEFAULT 'Standard Shift',
      ADD COLUMN IF NOT EXISTS late_buffer_minutes INTEGER DEFAULT 15,
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

      -- 2. Granular Attendance Logs
      ALTER TABLE attendance 
      ADD COLUMN IF NOT EXISTS shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS clock_in_method VARCHAR(20) DEFAULT 'manual', -- 'manual', 'biometric', 'qr', 'app'
      ADD COLUMN IF NOT EXISTS clock_out_method VARCHAR(20) DEFAULT 'manual',
      ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS is_overtime BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS clock_in_loc POINT, -- Lat/Lng for geofencing
      ADD COLUMN IF NOT EXISTS clock_out_loc POINT;

      -- 3. Biometric Hardware Integration
      CREATE TABLE IF NOT EXISTS biometric_devices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        device_name VARCHAR(100) NOT NULL,
        device_serial VARCHAR(100) UNIQUE NOT NULL,
        api_key VARCHAR(100) NOT NULL,
        last_sync_at TIMESTAMP WITH TIME ZONE,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 4. Biometric Raw Logs (for auditing)
      CREATE TABLE IF NOT EXISTS biometric_raw_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        device_id UUID REFERENCES biometric_devices(id) ON DELETE CASCADE,
        staff_external_id VARCHAR(50) NOT NULL,
        event_time TIMESTAMP WITH TIME ZONE NOT NULL,
        event_type VARCHAR(20) NOT NULL, -- 'check_in', 'check_out'
        is_processed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Employee Duty & Biometric schema deployed.');
  } catch (err) {
    console.error('❌ Duty Cycle evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
