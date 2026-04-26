import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating global reservation infrastructure...');
  try {
    await db.query(`
      ALTER TABLE reservations 
      ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'walk_in', -- google, meta, web, walk_in, app
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS whatsapp_sent BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS loyalty_id UUID REFERENCES customers(id);

      CREATE TABLE IF NOT EXISTS reservation_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) UNIQUE,
        buffer_minutes INT DEFAULT 15,
        auto_assign BOOLEAN DEFAULT true,
        max_party_size INT DEFAULT 12,
        allow_online_booking BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_reservations_source ON reservations(source);
      CREATE INDEX IF NOT EXISTS idx_reservations_datetime ON reservations(reservation_at);
    `);
    console.log('✅ Reservation infrastructure updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
