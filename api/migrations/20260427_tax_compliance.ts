import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Upgrading database for Advanced Taxation & Compliance...');
  try {
    await db.query(`
      -- 1. Add HSN/SAC codes to Menu Items
      ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(20);

      -- 2. Add HSN/SAC codes to Modifiers (for separate taxability if needed)
      ALTER TABLE modifiers ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(20);

      -- 3. Enhance Expenses for ITC tracking
      ALTER TABLE expenses 
      ADD COLUMN IF NOT EXISTS tax_paise BIGINT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS vendor_gstin VARCHAR(20),
      ADD COLUMN IF NOT EXISTS is_itc_eligible BOOLEAN DEFAULT true;

      -- 4. Enhance Purchase Orders for Tax Tracking
      ALTER TABLE purchase_order_items 
      ADD COLUMN IF NOT EXISTS tax_percent FLOAT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS tax_paise BIGINT DEFAULT 0;

      -- 5. Add GSTR1-style View for Reporting
      CREATE OR REPLACE VIEW view_gstr1_b2c_small AS
      SELECT 
        outlet_id,
        DATE_TRUNC('month', created_at) as month,
        SUM(subtotal_paise) as taxable_value,
        SUM((tax_split->>'cgst')::bigint) as cgst,
        SUM((tax_split->>'sgst')::bigint) as sgst,
        SUM((tax_split->>'igst')::bigint) as igst,
        SUM(tax_total_paise) as total_tax
      FROM bills
      WHERE status = 'paid'
      GROUP BY outlet_id, DATE_TRUNC('month', created_at);
    `);
    console.log('✅ Tax compliance schema updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
