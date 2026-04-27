import { db } from '../../lib/db';

export async function getUnifiedIntelligence(chain_id: string, outlet_id?: string) {
  const scope = outlet_id ? 'outlet' : 'chain';
  const filter = outlet_id ? `WHERE outlet_id = '${outlet_id}'` : `WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = '${chain_id}')`;

  // 1. Sales & Performance
  const sales = await db.query(`
    SELECT COALESCE(SUM(total_paise), 0)::bigint as revenue, COUNT(*)::int as orders 
    FROM bills ${filter} AND status = 'paid' AND created_at > NOW() - INTERVAL '24 hours'
  `);

  // 2. People (EPI)
  const epi = await db.query(`
    SELECT AVG(speed_score + punctuality_score + sales_score + rating_score) / 4 as avg_epi 
    FROM employee_performance_index 
    WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)
  `, [chain_id]);

  // 3. Guest Sentiment
  const sentiment = await db.query(`
    SELECT AVG(sentiment_score) as avg_sentiment 
    FROM social_reputation_logs 
    WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)
  `, [chain_id]);

  // 4. Equipment Health
  const health = await db.query(`
    SELECT COUNT(*)::int as warning_count 
    FROM equipment_registry 
    WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1) AND status != 'operational'
  `, [chain_id]);

  // 5. Sustainability
  const eco = await db.query(`
    SELECT SUM(co2_impact_kg) as co2_saved 
    FROM sustainability_waste_logs 
    WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)
  `, [chain_id]);

  // 6. Waitlist Pressure
  const queue = await db.query(`
    SELECT COUNT(*)::int as active_waiting 
    FROM waitlist_entries 
    WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1) AND status = 'waiting'
  `, [chain_id]);

  return {
    real_time: {
      revenue: sales.rows[0].revenue,
      orders: sales.rows[0].orders,
      active_waitlist: queue.rows[0].active_waiting
    },
    intelligence: {
      epi_score: parseFloat(epi.rows[0].avg_epi || 0).toFixed(1),
      sentiment_score: parseFloat(sentiment.rows[0].avg_sentiment || 0).toFixed(2),
      eco_impact_kg: parseFloat(eco.rows[0].co2_saved || 0).toFixed(1),
      equipment_warnings: health.rows[0].warning_count
    },
    timestamp: new Date().toISOString()
  };
}
