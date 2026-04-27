import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Evolving Adruva Loyalty & Referral Engine...');
  try {
    await db.query(`
      -- 1. Add Tiers and Referral Metadata to Customers
      DO $$ BEGIN
        CREATE TYPE customer_tier AS ENUM ('bronze', 'silver', 'gold', 'platinum');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS tier customer_tier DEFAULT 'bronze',
      ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
      ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES customers(id),
      ADD COLUMN IF NOT EXISTS points_expiring_at TIMESTAMPTZ;

      -- 2. Backfill referral codes
      UPDATE customers SET referral_code = UPPER(SUBSTRING(MD5(id::text), 1, 8)) WHERE referral_code IS NULL;

      -- 3. Loyalty Transactions Expansion
      ALTER TABLE loyalty_transactions
      ADD COLUMN IF NOT EXISTS tier_at_time customer_tier,
      ADD COLUMN IF NOT EXISTS description TEXT;

      -- 4. Referral Rewards Table
      CREATE TABLE IF NOT EXISTS referral_rewards (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        referrer_points INTEGER DEFAULT 500, -- Points for the one who shared
        referee_points INTEGER DEFAULT 200,  -- Points for the new joiner
        min_order_paise INTEGER DEFAULT 50000, -- Referee must spend this much to trigger reward
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 5. Indexing for performance
      CREATE INDEX IF NOT EXISTS idx_customer_referral ON customers(referral_code);
      CREATE INDEX IF NOT EXISTS idx_customer_tier ON customers(tier);
    `);
    console.log('✅ Loyalty ecosystem upgraded.');
  } catch (err) {
    console.error('❌ Upgrade failed:', err);
  } finally {
    process.exit();
  }
}

run();
