import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Adding supplier performance columns...');
  try {
    await db.query(`
      ALTER TABLE stock_movements 
      ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id),
      ADD COLUMN IF NOT EXISTS delivery_rating INT CHECK (delivery_rating BETWEEN 1 AND 5),
      ADD COLUMN IF NOT EXISTS delivery_status TEXT, -- on_time, late, early
      ADD COLUMN IF NOT EXISTS delivery_notes TEXT;

      ALTER TABLE suppliers
      ADD COLUMN IF NOT EXISTS performance_score FLOAT DEFAULT 5.0,
      ADD COLUMN IF NOT EXISTS total_deliveries INT DEFAULT 0;

      CREATE INDEX IF NOT EXISTS idx_movements_supplier ON stock_movements(supplier_id);
    `);
    console.log('✅ Supplier performance columns added.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
