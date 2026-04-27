import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Establishing Territory Management & Area Oversight Infrastructure...');
  try {
    await db.query(`
      -- 1. Area Manager Roles
      ALTER TABLE staff 
      ADD COLUMN IF NOT EXISTS is_area_manager BOOLEAN DEFAULT FALSE;

      -- 2. Territory Mapping
      CREATE TABLE IF NOT EXISTS area_manager_territories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        manager_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (manager_id, outlet_id)
      );

      -- 3. Area Audits (specific to area visits)
      CREATE TABLE IF NOT EXISTS territory_field_reports (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        manager_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'escalated')),
        operational_score INTEGER,
        hygiene_score INTEGER,
        service_score INTEGER,
        findings TEXT,
        action_plan TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Territory & Area Oversight schema deployed.');
  } catch (err) {
    console.error('❌ Territory evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
