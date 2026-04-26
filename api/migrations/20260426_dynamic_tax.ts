import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Linking menu items to tax slabs...');
  try {
    await db.query(`
      ALTER TABLE menu_categories 
      ADD COLUMN IF NOT EXISTS tax_slab_id UUID REFERENCES tax_slabs(id) ON DELETE SET NULL;

      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS tax_slab_id UUID REFERENCES tax_slabs(id) ON DELETE SET NULL;
    `);
    console.log('✅ Menu items linked to tax slabs.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
