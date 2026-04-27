import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Employee Performance Index (EPI) & Achievement Infrastructure...');
  try {
    await db.query(`
      -- 1. Daily Performance Index
      CREATE TABLE IF NOT EXISTS staff_performance_indices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        speed_rating DECIMAL(3,1) DEFAULT 5.0, -- Based on KDS prep times
        punctuality_rating DECIMAL(3,1) DEFAULT 5.0, -- Based on late arrivals
        sales_rating DECIMAL(3,1) DEFAULT 5.0, -- Based on upsells/bill value
        customer_rating DECIMAL(3,1) DEFAULT 5.0, -- Based on feedback link
        overall_epi DECIMAL(3,1) GENERATED ALWAYS AS ((speed_rating + punctuality_rating + sales_rating + customer_rating) / 4.0) STORED,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (staff_id, date)
      );

      -- 2. Staff Achievements & Badges
      CREATE TABLE IF NOT EXISTS staff_achievements (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
        achievement_type VARCHAR(50) NOT NULL, -- 'upsell_king', 'speed_demon', 'perfect_week', 'guest_favorite'
        metadata JSONB DEFAULT '{}',
        earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Historical Monthly Snapshots
      CREATE TABLE IF NOT EXISTS staff_monthly_summaries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
        month DATE NOT NULL,
        avg_epi DECIMAL(3,1),
        total_sales_paise BIGINT DEFAULT 0,
        avg_prep_time_seconds INTEGER,
        late_count INTEGER DEFAULT 0,
        UNIQUE (staff_id, month)
      );

      CREATE INDEX IF NOT EXISTS idx_epi_staff_date ON staff_performance_indices(staff_id, date);
      CREATE INDEX IF NOT EXISTS idx_epi_outlet_date ON staff_performance_indices(outlet_id, date);
    `);
    console.log('✅ EPI & Achievement schema deployed.');
  } catch (err) {
    console.error('❌ EPI evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
