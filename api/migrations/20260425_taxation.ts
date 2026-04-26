import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating tax compliance infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS tax_slabs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id),
        name TEXT NOT NULL, -- e.g., GST 5%
        cgst_percent FLOAT DEFAULT 0,
        sgst_percent FLOAT DEFAULT 0,
        igst_percent FLOAT DEFAULT 0,
        vat_percent FLOAT DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE bills 
      ADD COLUMN IF NOT EXISTS tax_split JSONB DEFAULT '{}', -- { cgst: 100, sgst: 100 }
      ADD COLUMN IF NOT EXISTS tax_total_paise BIGINT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_tax_inclusive BOOLEAN DEFAULT false;

      CREATE INDEX IF NOT EXISTS idx_bills_tax_date ON bills(created_at);
    `);
    console.log('✅ Tax compliance tables and columns created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
