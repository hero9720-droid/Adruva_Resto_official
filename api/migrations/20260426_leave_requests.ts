import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating leave management infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
        type TEXT NOT NULL, -- sick, casual, vacation, unpaid
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status TEXT DEFAULT 'pending', -- pending, approved, rejected
        manager_id UUID REFERENCES staff(id),
        manager_notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_leaves_outlet ON leave_requests(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_leaves_staff ON leave_requests(staff_id);
    `);
    console.log('✅ Leave request tables created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
