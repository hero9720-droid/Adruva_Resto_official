import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating payroll and attendance infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS payroll_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        staff_id UUID NOT NULL REFERENCES staff(id) UNIQUE,
        base_salary_paise BIGINT DEFAULT 0,
        hourly_rate_paise BIGINT DEFAULT 0,
        overtime_multiplier FLOAT DEFAULT 1.5,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payroll_cycles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID NOT NULL REFERENCES chains(id),
        month INT NOT NULL,
        year INT NOT NULL,
        status TEXT DEFAULT 'draft', -- draft, processing, completed
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(chain_id, month, year)
      );

      CREATE TABLE IF NOT EXISTS payslips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cycle_id UUID NOT NULL REFERENCES payroll_cycles(id) ON DELETE CASCADE,
        staff_id UUID NOT NULL REFERENCES staff(id),
        base_paid_paise BIGINT DEFAULT 0,
        overtime_paid_paise BIGINT DEFAULT 0,
        bonus_paise BIGINT DEFAULT 0,
        deductions_paise BIGINT DEFAULT 0,
        net_paid_paise BIGINT DEFAULT 0,
        status TEXT DEFAULT 'generated', -- generated, approved, paid
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_payslips_staff ON payslips(staff_id);
      CREATE INDEX IF NOT EXISTS idx_payslips_cycle ON payslips(cycle_id);
    `);
    console.log('✅ Payroll tables created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
