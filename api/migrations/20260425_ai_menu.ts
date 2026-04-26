import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating AI menu generation infrastructure...');
  try {
    await db.query(`
      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS description_hindi TEXT,
      ADD COLUMN IF NOT EXISTS ai_metadata JSONB DEFAULT '{"generated": false}';

      -- Create a table for menu inspirations/styles
      CREATE TABLE IF NOT EXISTS menu_styles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
        style_name TEXT NOT NULL, -- e.g., "Gourmet", "Street Food", "Healthy", "Desi"
        tone TEXT NOT NULL, -- e.g., "Luxurious", "Vibrant", "Clean", "Authentic"
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      INSERT INTO menu_styles (style_name, tone)
      VALUES 
      ('Royal Indian', 'Luxurious and authentic'),
      ('Modern Fusion', 'Vibrant and experimental'),
      ('Healthy Living', 'Clean and transparent')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ AI menu infrastructure updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
