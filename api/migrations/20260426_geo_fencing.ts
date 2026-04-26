import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating geo-fencing marketing infrastructure...');
  try {
    await db.query(`
      ALTER TABLE outlets 
      ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
      ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
      ADD COLUMN IF NOT EXISTS geo_fence_radius_km DECIMAL(5, 2) DEFAULT 2.0;

      CREATE TABLE IF NOT EXISTS geo_campaigns (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        trigger_message TEXT NOT NULL,
        coupon_id UUID REFERENCES coupons(id),
        min_distance_meters INT DEFAULT 500,
        is_active BOOLEAN DEFAULT true,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS geo_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
        outlet_id UUID REFERENCES outlets(id) ON DELETE CASCADE,
        campaign_id UUID REFERENCES geo_campaigns(id),
        distance_meters INT,
        converted BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_geo_outlet ON geo_events(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_geo_customer ON geo_events(customer_id);
    `);
    console.log('✅ Geo-fencing infrastructure updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
