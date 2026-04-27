import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Establishing Real-Time P&L & Financial Forecasting Infrastructure...');
  try {
    await db.query(`
      -- 1. P&L Monthly Snapshots
      CREATE TABLE IF NOT EXISTS pnl_snapshots (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        period_start DATE NOT NULL,
        period_end DATE NOT NULL,
        total_revenue_paise BIGINT DEFAULT 0,
        total_cogs_paise BIGINT DEFAULT 0, -- Ingredients used
        total_labor_paise BIGINT DEFAULT 0, -- Salaries + Overtime
        total_overhead_paise BIGINT DEFAULT 0, -- Rent, Utilities, Fixed
        total_marketing_paise BIGINT DEFAULT 0,
        net_profit_paise BIGINT DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (outlet_id, period_start)
      );

      -- 2. Expense Classification Enhancements
      ALTER TABLE expenses 
      ADD COLUMN IF NOT EXISTS expense_type VARCHAR(20) DEFAULT 'variable' CHECK (expense_type IN ('fixed', 'variable')),
      ADD COLUMN IF NOT EXISTS recurring_interval VARCHAR(20); -- 'monthly', 'quarterly'

      -- 3. AI Financial Projections
      CREATE TABLE IF NOT EXISTS financial_projections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        forecast_date DATE NOT NULL,
        predicted_revenue_paise BIGINT,
        predicted_expense_paise BIGINT,
        confidence_score DECIMAL(3,2),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (outlet_id, forecast_date)
      );

      -- 4. Profitability Alerts
      CREATE TABLE IF NOT EXISTS profitability_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        alert_type VARCHAR(50) NOT NULL, -- 'margin_drop', 'high_cogs', 'budget_exceeded'
        message TEXT,
        severity VARCHAR(20) DEFAULT 'warning',
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
    console.log('✅ Real-Time P&L & Forecasting schema deployed.');
  } catch (err) {
    console.error('❌ P&L evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
