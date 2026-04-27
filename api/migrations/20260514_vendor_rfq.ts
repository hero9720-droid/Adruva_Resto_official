import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Architecting Vendor Portal & Competitive RFQ Infrastructure...');
  try {
    await db.query(`
      -- 1. Enable Supplier Logins
      ALTER TABLE suppliers 
      ADD COLUMN IF NOT EXISTS login_enabled BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS password_hash TEXT,
      ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 5.00;

      -- 2. Request for Quotes (RFQs)
      CREATE TABLE IF NOT EXISTS rfqs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        deadline TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'awarded', 'cancelled')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. RFQ Items
      CREATE TABLE IF NOT EXISTS rfq_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
        ingredient_name VARCHAR(200) NOT NULL,
        quantity DECIMAL(10,3) NOT NULL,
        unit VARCHAR(20) NOT NULL
      );

      -- 4. Vendor Bids
      CREATE TABLE IF NOT EXISTS rfq_bids (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID NOT NULL REFERENCES rfqs(id) ON DELETE CASCADE,
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        price_paise BIGINT NOT NULL,
        delivery_days INTEGER NOT NULL,
        notes TEXT,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (rfq_id, supplier_id)
      );

      -- 5. RFQ Notifications for Vendors
      CREATE TABLE IF NOT EXISTS vendor_notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        message TEXT,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Vendor Portal & RFQ schema deployed.');
  } catch (err) {
    console.error('❌ RFQ evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
