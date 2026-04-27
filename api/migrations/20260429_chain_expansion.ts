import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Scaling Adruva to Multi-Tenant Central Kitchen Architecture...');
  try {
    await db.query(`
      -- 1. Upgrade Outlets
      ALTER TABLE outlets 
      ADD COLUMN IF NOT EXISTS outlet_type VARCHAR(30) DEFAULT 'store' 
      CHECK (outlet_type IN ('store', 'central_kitchen', 'dark_store', 'warehouse')),
      ADD COLUMN IF NOT EXISTS is_central_kitchen BOOLEAN DEFAULT FALSE;

      -- 2. Stock Requisitions (Indents)
      CREATE TABLE IF NOT EXISTS stock_requisitions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        from_outlet_id UUID NOT NULL REFERENCES outlets(id), -- The requester
        to_outlet_id UUID NOT NULL REFERENCES outlets(id),   -- Usually the kitchen/warehouse
        status VARCHAR(20) DEFAULT 'pending'
          CHECK (status IN ('pending', 'approved', 'rejected', 'processing', 'shipped', 'received', 'cancelled')),
        priority VARCHAR(10) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
        
        items JSONB NOT NULL, -- Array of { ingredient_id, quantity, unit }
        
        created_by UUID REFERENCES staff(id),
        processed_by UUID REFERENCES staff(id), -- Who approved/shipped it
        
        notes TEXT,
        rejection_reason TEXT,
        
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_req_chain ON stock_requisitions(chain_id);
      CREATE INDEX IF NOT EXISTS idx_req_status ON stock_requisitions(status);

      -- 3. Trigger for updated_at
      CREATE OR REPLACE FUNCTION update_requisition_timestamp()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      DROP TRIGGER IF EXISTS trg_update_requisition_timestamp ON stock_requisitions;
      CREATE TRIGGER trg_update_requisition_timestamp
      BEFORE UPDATE ON stock_requisitions
      FOR EACH ROW
      EXECUTE FUNCTION update_requisition_timestamp();
    `);
    console.log('✅ Chain architecture deployed.');
  } catch (err) {
    console.error('❌ Expansion failed:', err);
  } finally {
    process.exit();
  }
}

run();
