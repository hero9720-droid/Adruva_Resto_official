import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Orchestrating Social Media Sentiment & Reputation Bridge Infrastructure...');
  try {
    await db.query(`
      -- 1. Social Reputation Central Store
      CREATE TABLE IF NOT EXISTS social_reputation_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        platform VARCHAR(50) NOT NULL, -- 'google_my_business', 'meta', 'instagram', 'yelp'
        external_id VARCHAR(255), -- ID on the platform
        author_name VARCHAR(200),
        author_photo_url TEXT,
        content TEXT,
        rating_score DECIMAL(2,1),
        sentiment_score DECIMAL(3,2), -- 0.0 to 1.0 (Positive)
        ai_draft_reply TEXT,
        final_reply TEXT,
        reply_status VARCHAR(20) DEFAULT 'pending' CHECK (reply_status IN ('pending', 'approved', 'sent', 'ignored')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (platform, external_id)
      );

      -- 2. Brand Keyword Monitor
      CREATE TABLE IF NOT EXISTS social_brand_keywords (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        keyword VARCHAR(100) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Reputation Snapshots
      CREATE TABLE IF NOT EXISTS reputation_daily_stats (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        avg_sentiment DECIMAL(3,2),
        total_mentions INTEGER DEFAULT 0,
        platform_breakdown JSONB DEFAULT '{}',
        UNIQUE (outlet_id, date)
      );

      CREATE INDEX IF NOT EXISTS idx_reputation_outlet_platform ON social_reputation_logs(outlet_id, platform);
      CREATE INDEX IF NOT EXISTS idx_reputation_sentiment ON social_reputation_logs(sentiment_score);
    `);
    console.log('✅ Social Sentiment Bridge schema deployed.');
  } catch (err) {
    console.error('❌ Reputation evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
