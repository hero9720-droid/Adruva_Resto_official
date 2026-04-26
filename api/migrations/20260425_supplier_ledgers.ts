import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating automated supplier ledger infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        contact_person TEXT,
        phone TEXT,
        email TEXT,
        gst_number TEXT,
        address TEXT,
        payment_terms_days INT DEFAULT 30,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS supplier_ledgers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        outlet_id UUID REFERENCES outlets(id),
        type TEXT NOT NULL, -- CREDIT (purchase), DEBIT (payment)
        amount_paise BIGINT NOT NULL,
        description TEXT,
        reference_id UUID, -- Purchase Order ID or Payment ID
        balance_after_paise BIGINT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Update purchase_orders to link with ledger
      ALTER TABLE purchase_orders 
      ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid', -- unpaid, partial, paid
      ADD COLUMN IF NOT EXISTS amount_paid_paise BIGINT DEFAULT 0;

      CREATE INDEX IF NOT EXISTS idx_ledger_supplier ON supplier_ledgers(supplier_id);
      CREATE INDEX IF NOT EXISTS idx_ledger_outlet ON supplier_ledgers(outlet_id);
    `);
    console.log('✅ Supplier ledger infrastructure updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
