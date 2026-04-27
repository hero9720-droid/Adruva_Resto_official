import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Multi-Level Approval & Governance Infrastructure...');
  try {
    await db.query(`
      -- 1. Approval Workflows Config
      CREATE TABLE IF NOT EXISTS approval_workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        trigger_type VARCHAR(30) NOT NULL, -- 'expense', 'purchase_order', 'inventory_adjustment'
        threshold_paise BIGINT DEFAULT 0, -- 0 means all items of this type need approval
        required_role VARCHAR(30) NOT NULL, -- 'outlet_manager', 'chain_owner'
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. Approval Requests (The actual instances)
      CREATE TABLE IF NOT EXISTS approval_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        type VARCHAR(30) NOT NULL,
        reference_id UUID NOT NULL, -- Links to expense_id or po_id
        requested_by UUID REFERENCES staff(id),
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        decided_by UUID REFERENCES staff(id),
        decided_at TIMESTAMP WITH TIME ZONE,
        comments TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Update existing tables to support approval states
      ALTER TABLE expenses 
      ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved'; -- Default 'approved' for backward compatibility

      ALTER TABLE purchase_orders 
      ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'approved';

      -- 4. Seed basic workflows (e.g., Expenses > 5000 need approval)
      INSERT INTO approval_workflows (outlet_id, trigger_type, threshold_paise, required_role)
      SELECT id, 'expense', 500000, 'outlet_manager' FROM outlets
      ON CONFLICT DO NOTHING;

      CREATE INDEX IF NOT EXISTS idx_approvals_pending ON approval_requests(outlet_id, status) WHERE status = 'pending';
    `);
    console.log('✅ Approval & Governance schema deployed.');
  } catch (err) {
    console.error('❌ Approval evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
