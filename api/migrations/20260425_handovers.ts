import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating digital shift handover infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS shift_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        manager_id UUID NOT NULL REFERENCES staff(id),
        shift_type TEXT NOT NULL, -- morning, afternoon, night, full
        opening_cash_paise BIGINT DEFAULT 0,
        closing_cash_paise BIGINT DEFAULT 0,
        cash_difference_paise BIGINT DEFAULT 0,
        summary TEXT,
        incidents JSONB DEFAULT '[]', -- { type, description, priority }
        checklist_items JSONB DEFAULT '[]', -- { task, completed, by }
        status TEXT DEFAULT 'draft', -- draft, completed
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_shift_logs_outlet ON shift_logs(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_shift_logs_date ON shift_logs(created_at);
    `);
    console.log('✅ Shift log tables created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
