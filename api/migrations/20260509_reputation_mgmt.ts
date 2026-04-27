import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Deploying Reputation Management & AI Sentiment Analysis...');
  try {
    await db.query(`
      -- 1. Enhance Customer Feedback
      ALTER TABLE customer_feedback 
      ADD COLUMN IF NOT EXISTS sentiment_score DECIMAL(3,2), -- -1.00 to 1.00
      ADD COLUMN IF NOT EXISTS sentiment_label VARCHAR(20), -- 'positive', 'negative', 'neutral'
      ADD COLUMN IF NOT EXISTS ai_reply_draft TEXT,
      ADD COLUMN IF NOT EXISTS is_replied BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS reply_content TEXT,
      ADD COLUMN IF NOT EXISTS replied_at TIMESTAMP WITH TIME ZONE;

      -- 2. Feedback Topic Tracking
      CREATE TABLE IF NOT EXISTS feedback_topics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        feedback_id UUID NOT NULL REFERENCES customer_feedback(id) ON DELETE CASCADE,
        topic VARCHAR(100) NOT NULL, -- 'service', 'food_quality', 'price', 'ambience'
        sentiment VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- 3. Reputation Metrics Store
      CREATE TABLE IF NOT EXISTS reputation_insights (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id) ON DELETE CASCADE,
        average_nps DECIMAL(4,2),
        positive_sentiment_percent DECIMAL(5,2),
        negative_sentiment_percent DECIMAL(5,2),
        last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE (outlet_id)
      );
    `);
    console.log('✅ Reputation & Sentiment schema deployed.');
  } catch (err) {
    console.error('❌ Reputation evolution failed:', err);
  } finally {
    process.exit();
  }
}

run();
