import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Scaling Brand Infrastructure for Franchise Operations...');
  try {
    await db.query(`
      -- 1. Franchise Metadata on Outlets
      ALTER TABLE outlets 
      ADD COLUMN IF NOT EXISTS franchise_model VARCHAR(20) DEFAULT 'COCO' 
      CHECK (franchise_model IN ('COCO', 'FOCO', 'FOFO')),
      ADD COLUMN IF NOT EXISTS royalty_percentage DECIMAL(5,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS fixed_monthly_fee_paise INTEGER DEFAULT 0;

      -- 2. Royalty Invoicing
      CREATE TABLE IF NOT EXISTS franchise_royalty_invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        period_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
        total_sales_paise BIGINT NOT NULL,
        royalty_amount_paise INTEGER NOT NULL,
        fixed_fee_paise INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
        due_at TIMESTAMP WITH TIME ZONE,
        paid_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Franchise Performance Audits
      CREATE TABLE IF NOT EXISTS franchise_audits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        auditor_id UUID NOT NULL, -- Chain User ID
        score DECIMAL(4,2) NOT NULL, -- 0-100
        checklist_data JSONB DEFAULT '{}',
        comments TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Franchise & Royalty schema deployed.');
  } catch (err) {
    console.error('❌ Franchise evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
