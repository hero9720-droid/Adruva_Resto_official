import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating AI-Driven Waitlist & Predictive Queuing Infrastructure...');
  try {
    await db.query(`
      -- 1. Waitlist Entries with Predictive Metadata
      CREATE TABLE IF NOT EXISTS waitlist_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        customer_name VARCHAR(200) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        party_size INTEGER NOT NULL DEFAULT 2,
        
        -- Predictive Timers
        estimated_wait_minutes INTEGER DEFAULT 0,
        actual_wait_minutes INTEGER DEFAULT 0,
        
        -- State Management
        status VARCHAR(20) DEFAULT 'waiting' 
        CHECK (status IN ('waiting', 'called', 'seated', 'cancelled', 'expired')),
        
        -- Timing Markers
        joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        notified_at TIMESTAMP WITH TIME ZONE,
        seated_at TIMESTAMP WITH TIME ZONE,
        
        -- Metadata
        source VARCHAR(30) DEFAULT 'walk_in', -- 'walk_in', 'qr', 'app'
        notes TEXT
      );

      -- 2. Predictive Table Release Tracking
      ALTER TABLE tables 
      ADD COLUMN IF NOT EXISTS expected_release_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS occupancy_started_at TIMESTAMP WITH TIME ZONE;

      -- 3. Indexing for high-frequency queue management
      CREATE INDEX IF NOT EXISTS idx_waitlist_outlet_status ON waitlist_entries(outlet_id, status);
      CREATE INDEX IF NOT EXISTS idx_waitlist_phone ON waitlist_entries(phone);
    `);
    console.log('✅ Predictive Waitlist schema deployed.');
  } catch (err) {
    console.error('❌ Waitlist evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
