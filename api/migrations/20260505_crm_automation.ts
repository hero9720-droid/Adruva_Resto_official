import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Building Advanced CRM & Marketing Automation Engine...');
  try {
    await db.query(`
      -- 1. Enhance Customer Data
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS birthday DATE,
      ADD COLUMN IF NOT EXISTS anniversary DATE,
      ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS is_vip BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS segment VARCHAR(50) DEFAULT 'new'; -- 'vip', 'regular', 'at_risk', 'churned'

      -- 2. Marketing Automation Logs
      CREATE TABLE IF NOT EXISTS marketing_campaign_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        campaign_type VARCHAR(100) NOT NULL, -- 'birthday_gift', 'churn_prevention', 'vip_invite'
        reward_points INTEGER DEFAULT 0,
        notified_via VARCHAR(20), -- 'email', 'sms', 'whatsapp'
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Customer Preferences Indexing
      CREATE INDEX IF NOT EXISTS idx_customers_segment ON customers(segment);
    `);
    console.log('✅ CRM & Marketing schema deployed.');
  } catch (err) {
    console.error('❌ CRM evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
