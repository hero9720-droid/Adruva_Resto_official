import { db } from '../../lib/db';

export async function getCustomerInsights(chain_id: string) {
  const segments = await db.query(`
    SELECT 
      segment, 
      COUNT(*) as count,
      SUM(lifetime_spend_paise) as total_spend
    FROM customers
    WHERE chain_id = $1
    GROUP BY segment
  `, [chain_id]);

  const retention = await db.query(`
    SELECT 
      (COUNT(CASE WHEN visit_count > 1 THEN 1 END) * 100.0 / COUNT(*)) as retention_rate
    FROM customers
    WHERE chain_id = $1
  `, [chain_id]);

  return {
    segments: segments.rows,
    retentionRate: parseFloat(retention.rows[0].retention_rate || '0')
  };
}

export async function updateCustomerSegments(chain_id: string) {
  // 1. VIP: Top 5% by spend
  await db.query(`
    UPDATE customers 
    SET segment = 'vip', is_vip = TRUE
    WHERE chain_id = $1 AND lifetime_spend_paise >= (
      SELECT PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY lifetime_spend_paise)
      FROM customers WHERE chain_id = $1
    )
  `, [chain_id]);

  // 2. At Risk: Last visit > 30 days
  await db.query(`
    UPDATE customers 
    SET segment = 'at_risk'
    WHERE chain_id = $1 AND last_visit_at < NOW() - INTERVAL '30 days' AND segment != 'vip'
  `, [chain_id]);

  // 3. Regular: Visit count > 3
  await db.query(`
    UPDATE customers 
    SET segment = 'regular'
    WHERE chain_id = $1 AND visit_count > 3 AND segment NOT IN ('vip', 'at_risk')
  `, [chain_id]);
}

export async function processDailyAutomatedMarketing(chain_id: string) {
  const today = new Date().toISOString().substring(5, 10); // MM-DD

  // Birthday Rewards
  const birthdays = await db.query(`
    SELECT id, name FROM customers 
    WHERE chain_id = $1 AND TO_CHAR(birthday, 'MM-DD') = $2
  `, [chain_id, today]);

  for (const customer of birthdays.rows) {
    // Award 500 loyalty points
    await db.query(`
      UPDATE customers SET loyalty_points = loyalty_points + 500 WHERE id = $1
    `, [customer.id]);

    await db.query(`
      INSERT INTO marketing_campaign_logs (chain_id, customer_id, campaign_type, reward_points)
      VALUES ($1, $2, 'birthday_gift', 500)
    `, [chain_id, customer.id]);
  }

  return { birthdaysProcessed: birthdays.rowCount };
}
