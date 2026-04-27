import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Architecting Central Kitchen & Internal Supply Chain...');
  try {
    await db.query(`
      -- 1. Base Kitchen Flag
      ALTER TABLE outlets 
      ADD COLUMN IF NOT EXISTS is_base_kitchen BOOLEAN DEFAULT FALSE;

      -- 2. Production Batches (For central prep)
      CREATE TABLE IF NOT EXISTS production_batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE, -- The base kitchen
        item_name VARCHAR(200) NOT NULL, -- e.g., 'Tomato Sauce Base', 'Marinated Chicken'
        quantity_planned DECIMAL(10,3) NOT NULL,
        quantity_actual DECIMAL(10,3),
        unit VARCHAR(20) NOT NULL,
        status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'in_production', 'completed', 'cancelled')),
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Enhance Transfers for Internal Supply
      ALTER TABLE stock_transfers 
      ADD COLUMN IF NOT EXISTS is_internal_supply BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS production_batch_id UUID REFERENCES production_batches(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS dispatch_time TIMESTAMP WITH TIME ZONE;

      -- 4. Central Inventory Alerts
      CREATE TABLE IF NOT EXISTS supply_chain_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL, -- 'shortage', 'delayed_dispatch'
        message TEXT,
        is_resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Central Supply Chain schema deployed.');
  } catch (err) {
    console.error('❌ Supply chain evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
