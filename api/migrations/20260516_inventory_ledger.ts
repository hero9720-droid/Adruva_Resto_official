import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Automated Stock Ledger & Forensic Audit Infrastructure...');
  try {
    await db.query(`
      -- 1. Immutable Inventory Ledger
      CREATE TABLE IF NOT EXISTS inventory_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
        staff_id UUID REFERENCES staff(id),
        type VARCHAR(30) NOT NULL, -- 'purchase', 'sale', 'waste', 'transfer_in', 'transfer_out', 'audit_adjust', 'production'
        quantity_delta DECIMAL(12,4) NOT NULL,
        balance_after DECIMAL(12,4) NOT NULL,
        reference_id UUID, -- Links to Order, PO, Transfer, or Waste Log
        reason_code VARCHAR(50), -- e.g., 'damaged_on_arrival', 'monthly_audit'
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. Audit Session Tracking
      CREATE TABLE IF NOT EXISTS inventory_audits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        conducted_by UUID REFERENCES staff(id),
        status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'reconciled'
        started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        discrepancy_value_paise BIGINT DEFAULT 0
      );

      -- 3. Audit Items
      CREATE TABLE IF NOT EXISTS inventory_audit_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        audit_id UUID NOT NULL REFERENCES inventory_audits(id) ON DELETE CASCADE,
        ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
        system_qty DECIMAL(12,4) NOT NULL,
        physical_qty DECIMAL(12,4) NOT NULL,
        discrepancy_qty DECIMAL(12,4) NOT NULL,
        notes TEXT
      );

      -- 4. High-Performance Forensic Indexes
      CREATE INDEX IF NOT EXISTS idx_ledger_ingredient_date ON inventory_ledger(ingredient_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_ledger_outlet_date ON inventory_ledger(outlet_id, created_at DESC);
    `);
    console.log('✅ Stock Ledger & Audit schema deployed.');
  } catch (err) {
    console.error('❌ Ledger evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
