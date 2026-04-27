import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Customer Lifetime Value (CLV) & Predictive CRM Infrastructure...');
  try {
    await db.query(`
      -- 1. CLV & Predictive Analytics Store
      CREATE TABLE IF NOT EXISTS customer_clv_projections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
        chain_id UUID NOT NULL REFERENCES chains(id) ON DELETE CASCADE,
        
        -- RFM Metrics
        rfm_recency INTEGER, -- Days since last visit
        rfm_frequency INTEGER, -- Total visits
        rfm_monetary BIGINT, -- Total spend (paise)
        
        -- Predictive Metrics
        churn_probability DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0
        predicted_clv_paise BIGINT DEFAULT 0,
        
        -- Segmentation
        segment VARCHAR(30), -- 'WHALE', 'LOYAL', 'AT_RISK', 'CHURNED', 'NEW'
        recommended_action VARCHAR(100),
        
        last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (customer_id)
      );

      -- 2. Performance Indexes for CRM
      CREATE INDEX IF NOT EXISTS idx_clv_chain_segment ON customer_clv_projections(chain_id, segment);
      CREATE INDEX IF NOT EXISTS idx_clv_churn_risk ON customer_clv_projections(churn_probability DESC);

      -- 3. Update main customer table with segment shortcut
      ALTER TABLE customers 
      ADD COLUMN IF NOT EXISTS clv_segment VARCHAR(30) DEFAULT 'NEW';
    `);
    console.log('✅ Predictive CLV schema deployed.');
  } catch (err) {
    console.error('❌ CLV evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
