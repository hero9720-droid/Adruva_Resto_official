import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating viral referral infrastructure...');
  try {
    await db.query(`
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
      ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES customers(id);

      CREATE TABLE IF NOT EXISTS referral_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
        reward_amount_paise BIGINT DEFAULT 10000, -- ₹100 reward
        min_order_value_paise BIGINT DEFAULT 50000, -- ₹500 min order
        reward_type TEXT DEFAULT 'loyalty_points', -- cash_credit, loyalty_points
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS referral_conversions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        referrer_id UUID NOT NULL REFERENCES customers(id),
        referee_id UUID NOT NULL REFERENCES customers(id),
        order_id UUID REFERENCES orders(id),
        reward_amount_paise BIGINT,
        status TEXT DEFAULT 'pending', -- pending, rewarded, void
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_customers_ref_code ON customers(referral_code);
      CREATE INDEX IF NOT EXISTS idx_referral_referrer ON referral_conversions(referrer_id);
    `);
    console.log('✅ Viral referral infrastructure updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
