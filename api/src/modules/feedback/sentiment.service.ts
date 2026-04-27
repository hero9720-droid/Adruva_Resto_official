import { db } from '../../lib/db';

export async function processExternalMention(outlet_id: string, data: any) {
  // Logic to ingest a review from GMB or Meta
  const { platform, external_id, author, content, rating } = data;
  
  // 1. Analyze Sentiment (Mock logic for now)
  const sentiment_score = rating >= 4 ? 0.9 : rating <= 2 ? 0.2 : 0.5;
  
  // 2. Draft AI Reply
  let ai_reply = "";
  if (sentiment_score > 0.7) {
    ai_reply = `Thank you so much ${author} for the kind words! We are thrilled you enjoyed your experience. See you soon!`;
  } else if (sentiment_score < 0.4) {
    ai_reply = `Hi ${author}, we are truly sorry to hear about your experience. We would love to make it right. Please DM us your contact info.`;
  } else {
    ai_reply = `Hi ${author}, thanks for the feedback. We appreciate your input and will work on improving!`;
  }

  await db.query(`
    INSERT INTO social_reputation_logs 
    (outlet_id, platform, external_id, author_name, content, rating_score, sentiment_score, ai_draft_reply)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT (platform, external_id) DO UPDATE 
    SET content = EXCLUDED.content, sentiment_score = EXCLUDED.sentiment_score
  `, [outlet_id, platform, external_id, author, content, rating, sentiment_score, ai_reply]);
}

export async function getReputationFeed(outlet_id: string) {
  const res = await db.query(`
    SELECT * FROM social_reputation_logs 
    WHERE outlet_id = $1 
    ORDER BY created_at DESC 
    LIMIT 20
  `, [outlet_id]);
  return res.rows;
}

export async function approveAndSendReply(id: string, final_reply: string) {
  // Update local DB
  const res = await db.query(`
    UPDATE social_reputation_logs 
    SET final_reply = $1, reply_status = 'sent' 
    WHERE id = $2 RETURNING *
  `, [final_reply, id]);
  
  // In a real scenario, we would then call the GMB/Meta API here
  return res.rows[0];
}
