import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Deploying Auto-Procurement Infrastructure...');
  try {
    await db.query(`
      -- 1. Suppliers (if not exists)
      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        contact_person VARCHAR(100),
        email VARCHAR(100),
        phone VARCHAR(20),
        address TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 2. Enhance Ingredients with Reorder Logic
      ALTER TABLE ingredients 
      ADD COLUMN IF NOT EXISTS reorder_level DECIMAL(10,3) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS reorder_quantity DECIMAL(10,3) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS preferred_supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 1;

      -- 3. Enhance POs
      ALTER TABLE purchase_orders 
      ADD COLUMN IF NOT EXISTS total_amount_paise INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS is_automated BOOLEAN DEFAULT FALSE;
    `);
    console.log('✅ Auto-Procurement schema deployed.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
