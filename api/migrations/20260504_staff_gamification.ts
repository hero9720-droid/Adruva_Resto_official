import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Activating Employee Gamification & Performance Tracking...');
  try {
    await db.query(`
      -- 1. Enhance Staff Table
      ALTER TABLE staff 
      ADD COLUMN IF NOT EXISTS gamification_points INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS current_rank VARCHAR(50) DEFAULT 'Rookie',
      ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]';

      -- 2. Performance Tracking Table
      CREATE TABLE IF NOT EXISTS staff_performance_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
        metric_type VARCHAR(50) NOT NULL, -- 'upsell', 'speed', 'review', 'attendance'
        points_awarded INTEGER DEFAULT 0,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Track Item Preparation (for Kitchen Performance)
      ALTER TABLE order_items 
      ADD COLUMN IF NOT EXISTS prepared_by UUID REFERENCES staff(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS preparation_started_at TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS preparation_ended_at TIMESTAMP WITH TIME ZONE;
    `);
    console.log('✅ Performance & Gamification schema deployed.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
