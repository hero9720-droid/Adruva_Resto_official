import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Centralized Franchisee Settlement & Financial Reconciliation...');
  try {
    await db.query(`
      -- 1. Settlement Adjustments (Shared Costs)
      CREATE TABLE IF NOT EXISTS franchise_settlement_adjustments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        period_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
        type VARCHAR(50) NOT NULL, -- 'marketing_share', 'tech_fee', 'training_fee', 'other_deduction'
        amount_paise BIGINT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. Enhanced Invoice Support
      ALTER TABLE franchise_royalty_invoices 
      ADD COLUMN IF NOT EXISTS adjustments_total_paise BIGINT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS net_payout_paise BIGINT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS payout_reference TEXT,
      ADD COLUMN IF NOT EXISTS notes TEXT;

      -- 3. Monthly Settlement Snapshots
      CREATE TABLE IF NOT EXISTS franchise_monthly_pnl (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        period_month VARCHAR(7) NOT NULL,
        gross_revenue_paise BIGINT DEFAULT 0,
        royalty_paise BIGINT DEFAULT 0,
        fixed_fees_paise BIGINT DEFAULT 0,
        adjustments_paise BIGINT DEFAULT 0,
        final_settlement_paise BIGINT DEFAULT 0,
        UNIQUE (outlet_id, period_month)
      );

      CREATE INDEX IF NOT EXISTS idx_settlement_period ON franchise_royalty_invoices(period_month);
    `);
    console.log('✅ Franchise Settlement schema deployed.');
  } catch (err) {
    console.error('❌ Settlement evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
