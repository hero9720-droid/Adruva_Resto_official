import 'dotenv/config';
import { db } from '../src/lib/db';

async function run() {
  console.log('Creating customer_feedback table...');
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS customer_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        outlet_id UUID NOT NULL REFERENCES outlets(id),
        bill_id UUID REFERENCES bills(id),
        customer_id UUID REFERENCES customers(id),
        rating_food INT CHECK (rating_food BETWEEN 1 AND 5),
        rating_service INT CHECK (rating_service BETWEEN 1 AND 5),
        rating_ambience INT CHECK (rating_ambience BETWEEN 1 AND 5),
        comment TEXT,
        sentiment TEXT DEFAULT 'neutral', -- positive, neutral, negative
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_feedback_outlet ON customer_feedback(outlet_id);
      CREATE INDEX IF NOT EXISTS idx_feedback_sentiment ON customer_feedback(sentiment);
    `);
    console.log('✅ Customer Feedback table created.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    process.exit();
  }
}

run();
