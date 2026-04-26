import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Starting Stock Transfers migration...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS stock_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id),
        from_outlet_id UUID NOT NULL REFERENCES outlets(id),
        to_outlet_id UUID NOT NULL REFERENCES outlets(id),
        ingredient_id UUID NOT NULL,
        quantity DECIMAL(12,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_by UUID,
        received_by UUID,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_stock_transfers_chain ON stock_transfers(chain_id);
      CREATE INDEX IF NOT EXISTS idx_stock_transfers_from ON stock_transfers(from_outlet_id);
      CREATE INDEX IF NOT EXISTS idx_stock_transfers_to ON stock_transfers(to_outlet_id);
    `);
    console.log('✅ Stock Transfers table created successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
