import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating maintenance and asset tables...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id),
        name TEXT NOT NULL,
        category TEXT, -- kitchen, electrical, furniture, pos
        serial_number TEXT,
        purchase_date DATE,
        warranty_expiry DATE,
        status TEXT DEFAULT 'active', -- active, maintenance, broken, retired
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS incidents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id),
        asset_id UUID REFERENCES assets(id),
        reported_by UUID REFERENCES staff(id),
        title TEXT NOT NULL,
        description TEXT,
        priority TEXT DEFAULT 'medium', -- low, medium, high, critical
        status TEXT DEFAULT 'open', -- open, in_progress, resolved, cancelled
        cost_paise BIGINT DEFAULT 0,
        resolved_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_assets_outlet ON assets(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_incidents_outlet ON incidents(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
    `);
    console.log('✅ Maintenance and Asset tables created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
