import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating global digital asset registry infrastructure...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS brand_assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        chain_id UUID REFERENCES chains(id) ON DELETE CASCADE,
        asset_type TEXT NOT NULL, -- logo_dark, logo_light, favicon, banner_web, banner_app
        url TEXT NOT NULL,
        is_active BOOLEAN DEFAULT true,
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      ALTER TABLE chains 
      ADD COLUMN IF NOT EXISTS brand_identity JSONB DEFAULT '{
        "colors": {"primary": "#000000", "secondary": "#ffffff", "accent": "#facc15"},
        "typography": {"font_family": "Inter", "heading_font": "Outfit"},
        "border_radius": "1rem"
      }';

      CREATE INDEX IF NOT EXISTS idx_brand_assets_chain ON brand_assets(chain_id);
    `);
    console.log('✅ Global digital asset registry updated.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
