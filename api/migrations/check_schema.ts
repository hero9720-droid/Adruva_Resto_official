import 'dotenv/config';
import { db } from '../src/lib/db';

async function check() {
  // Check demand_forecasts table structure
  const cols = await db.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'demand_forecasts' 
    ORDER BY ordinal_position
  `);
  console.log('demand_forecasts columns:', cols.rows.map((r: any) => r.column_name).join(', '));

  // Check existing indexes
  const indexes = await db.query(`
    SELECT indexname FROM pg_indexes 
    WHERE tablename = 'demand_forecasts'
  `);
  console.log('demand_forecasts indexes:', indexes.rows.map((r: any) => r.indexname).join(', '));

  process.exit(0);
}
check().catch(e => { console.error(e.message); process.exit(1); });
