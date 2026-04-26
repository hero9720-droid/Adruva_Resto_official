import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Adding menu constraints...');
  try {
    await db.query(`
      ALTER TABLE menu_categories ADD CONSTRAINT unique_outlet_category UNIQUE (outlet_id, name);
      ALTER TABLE menu_items ADD CONSTRAINT unique_outlet_item UNIQUE (outlet_id, name);
    `);
    console.log('✅ Menu constraints added.');
  } catch (err: any) {
    if (err.code === '42710') {
      console.log('ℹ️ Constraints already exist.');
    } else {
      console.error('❌ Failed:', err);
    }
  } finally {
    process.exit();
  }
}

run();
