import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating AI-Powered Menu Engineering & Profitability Matrix...');
  try {
    await db.query(`
      -- 1. Menu Performance & Matrix Storage
      CREATE TABLE IF NOT EXISTS menu_matrix_analysis (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
        
        -- Performance Metrics
        sales_count INTEGER DEFAULT 0,
        gross_profit_paise BIGINT DEFAULT 0,
        
        -- Matrix Classification
        classification VARCHAR(20), -- 'STAR', 'PLOWHORSE', 'PUZZLE', 'DOG'
        popularity_index VARCHAR(10), -- 'HIGH', 'LOW'
        profitability_index VARCHAR(10), -- 'HIGH', 'LOW'
        
        period_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
        calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        
        UNIQUE (menu_item_id, period_month)
      );

      -- 2. Indexing for fast analytics
      CREATE INDEX IF NOT EXISTS idx_menu_matrix_outlet_period ON menu_matrix_analysis(outlet_id, period_month);
      CREATE INDEX IF NOT EXISTS idx_menu_matrix_classification ON menu_matrix_analysis(classification);
    `);
    console.log('✅ Menu Engineering schema deployed.');
  } catch (err) {
    console.error('❌ Menu evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
