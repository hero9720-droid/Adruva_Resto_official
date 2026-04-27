import { db } from '../../lib/db';

export async function getReputationInsights(outlet_id: string) {
  const stats = await db.query(`
    SELECT 
      AVG(sentiment_score) as avg_sentiment,
      COUNT(*) FILTER (WHERE sentiment_label = 'positive') as positive_count,
      COUNT(*) FILTER (WHERE sentiment_label = 'negative') as negative_count,
      COUNT(*) FILTER (WHERE sentiment_label = 'neutral') as neutral_count
    FROM customer_feedback
    WHERE outlet_id = $1
  `, [outlet_id]);

  const topics = await db.query(`
    SELECT topic, sentiment, COUNT(*) as frequency
    FROM feedback_topics
    WHERE outlet_id = $1
    GROUP BY topic, sentiment
    ORDER BY frequency DESC
  `, [outlet_id]);

  return {
    overview: stats.rows[0],
    topics: topics.rows
  };
}

export async function analyzeFeedback(feedback_id: string) {
  const feedback = await db.query(`SELECT comment, rating_food, rating_service FROM customer_feedback WHERE id = $1`, [feedback_id]);
  const row = feedback.rows[0];

  // AI Sentiment Logic (Mocked)
  let sentiment_score = 0.5;
  let sentiment_label = 'positive';
  
  if (row.rating_food < 3 || row.rating_service < 3) {
    sentiment_score = -0.6;
    sentiment_label = 'negative';
  }

  const ai_reply_draft = sentiment_label === 'positive' 
    ? `Thank you so much for your kind words! We are thrilled you enjoyed the food. See you again soon!`
    : `We are truly sorry to hear about your experience. We take your feedback seriously and would like to make it right. Please reach out to us.`;

  await db.query(`
    UPDATE customer_feedback 
    SET sentiment_score = $1, sentiment_label = $2, ai_reply_draft = $3
    WHERE id = $4
  `, [sentiment_score, sentiment_label, ai_reply_draft, feedback_id]);

  return { sentiment_label, ai_reply_draft };
}

export async function postReply(feedback_id: string, content: string) {
  await db.query(`
    UPDATE customer_feedback 
    SET is_replied = TRUE, reply_content = $1, replied_at = NOW()
    WHERE id = $2
  `, [content, feedback_id]);
}
