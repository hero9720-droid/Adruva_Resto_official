import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Evolving Financial Compliance & Tax Architecture (GST/VAT Focus)...');
  try {
    await db.query(`
      -- 1. Dynamic Tax Slabs
      CREATE TABLE IF NOT EXISTS tax_slabs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL, -- e.g., 'GST 5%', 'VAT 12%'
        percentage DECIMAL(5,2) NOT NULL, -- e.g., 5.00, 18.00
        tax_code VARCHAR(20), -- e.g., 'GST-5'
        is_inclusive BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (outlet_id, tax_code)
      );

      -- 2. Compliance Metadata for Outlets
      ALTER TABLE outlets 
      ADD COLUMN IF NOT EXISTS gstin VARCHAR(20),
      ADD COLUMN IF NOT EXISTS fssai_license VARCHAR(30),
      ADD COLUMN IF NOT EXISTS vat_number VARCHAR(30),
      ADD COLUMN IF NOT EXISTS tax_config JSONB DEFAULT '{"default_slab": null, "inclusive_pricing": false}';

      -- 3. Dynamic Tax Breakdown for Bills
      ALTER TABLE bills 
      ADD COLUMN IF NOT EXISTS tax_breakdown JSONB DEFAULT '[]',
      ADD COLUMN IF NOT EXISTS total_tax_paise INTEGER DEFAULT 0;

      -- 4. Item-level Tax Overrides
      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS tax_slab_id UUID REFERENCES tax_slabs(id) ON DELETE SET NULL;

      -- 5. Seeding default GST slabs for Indian context (optional but helpful)
      -- Handled in application logic for better multi-region support.
    `);
    console.log('✅ Financial Compliance & Tax schema deployed.');
  } catch (err) {
    console.error('❌ Compliance evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
