import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Cleaning up duplicate menu items/categories...');
  try {
    // Keep only the latest entry for each name per outlet
    await db.query(`
      DELETE FROM menu_categories a USING menu_categories b
      WHERE a.id < b.id AND a.name = b.name AND a.outlet_id = b.outlet_id;

      DELETE FROM menu_items a USING menu_items b
      WHERE a.id < b.id AND a.name = b.name AND a.outlet_id = b.outlet_id;

      ALTER TABLE menu_categories ADD CONSTRAINT unique_outlet_category UNIQUE (outlet_id, name);
      ALTER TABLE menu_items ADD CONSTRAINT unique_outlet_item UNIQUE (outlet_id, name);
    `);
    console.log('✅ Cleanup and constraints successful.');
  } catch (err: any) {
    console.error('❌ Failed:', err);
  } finally {
    process.exit();
  }
}

run();
