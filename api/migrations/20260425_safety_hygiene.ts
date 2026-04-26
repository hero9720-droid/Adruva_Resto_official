import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating safety and hygiene infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS compliance_standards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        category TEXT NOT NULL, -- Kitchen, Dining, Storage, Staff
        checkpoints JSONB NOT NULL, -- Array of { question, type, required }
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS hygiene_audits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        auditor_id UUID NOT NULL REFERENCES staff(id),
        standard_id UUID REFERENCES compliance_standards(id),
        score INT DEFAULT 0,
        results JSONB NOT NULL, -- Array of { question, result (pass/fail/na), comment, photo_url }
        corrective_actions JSONB DEFAULT '[]', -- Array of { item, action, resolved_at }
        status TEXT DEFAULT 'completed',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_hygiene_outlet ON hygiene_audits(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_hygiene_auditor ON hygiene_audits(auditor_id);
    `);
    
    // Seed a basic standard if none exists
    await db.query(`
      INSERT INTO compliance_standards (chain_id, title, category, checkpoints)
      SELECT id, 'Daily Food Safety Check', 'Kitchen', '[
        {"question": "Fridge temperatures checked and within 0-4°C?", "type": "boolean", "required": true},
        {"question": "Food storage labels verified (FIFO)?", "type": "boolean", "required": true},
        {"question": "No signs of pest activity in dry storage?", "type": "boolean", "required": true},
        {"question": "Staff wearing clean uniforms and headgear?", "type": "boolean", "required": true},
        {"question": "Sanitization solution concentration verified?", "type": "boolean", "required": false}
      ]'::jsonb FROM chains LIMIT 1
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Safety and hygiene infrastructure updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
