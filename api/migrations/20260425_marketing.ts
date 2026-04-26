import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating marketing campaign tables...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS marketing_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id),
        name TEXT NOT NULL,
        template_body TEXT NOT NULL,
        audience_filter JSONB DEFAULT '{}', -- { min_points: 100, last_visit_before: '2024-01-01' }
        type TEXT DEFAULT 'whatsapp', -- whatsapp, email
        status TEXT DEFAULT 'draft', -- draft, scheduled, active, completed
        sent_count INT DEFAULT 0,
        scheduled_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_campaigns_chain ON marketing_campaigns(chain_id);
      CREATE INDEX IF NOT EXISTS idx_campaigns_status ON marketing_campaigns(status);
    `);
    console.log('✅ Marketing campaign tables created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
