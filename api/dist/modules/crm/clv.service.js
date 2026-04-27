"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCLVMetrics = calculateCLVMetrics;
exports.getCLVSegments = getCLVSegments;
exports.getAtRiskWhales = getAtRiskWhales;
const db_1 = require("../../lib/db");
async function calculateCLVMetrics(chain_id) {
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        // 1. Fetch all customers in chain
        const customers = await client.query(`SELECT * FROM customers WHERE chain_id = $1`, [chain_id]);
        for (const c of customers.rows) {
            // Calculate RFM basics
            const recency = c.last_visit_at ? Math.floor((Date.now() - new Date(c.last_visit_at).getTime()) / (1000 * 60 * 60 * 24)) : 999;
            const frequency = c.visit_count || 0;
            const monetary = Number(c.lifetime_spend_paise) || 0;
            // 2. Churn Logic
            // If haven't visited in 60 days, high churn risk
            let churn_prob = recency > 60 ? 0.9 : recency > 30 ? 0.5 : 0.1;
            // 3. Segment Logic
            let segment = 'NEW';
            if (monetary > 5000000)
                segment = 'WHALE'; // > ₹50,000
            else if (frequency > 10)
                segment = 'LOYAL';
            else if (recency > 90)
                segment = 'CHURNED';
            else if (recency > 45)
                segment = 'AT_RISK';
            // 4. Upsert Projection
            const predicted_clv = Math.round(monetary * 1.5); // Simple linear projection for now
            await client.query(`
        INSERT INTO customer_clv_projections (customer_id, chain_id, rfm_recency, rfm_frequency, rfm_monetary, churn_probability, predicted_clv_paise, segment)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (customer_id) DO UPDATE SET
          rfm_recency = EXCLUDED.rfm_recency,
          rfm_frequency = EXCLUDED.rfm_frequency,
          rfm_monetary = EXCLUDED.rfm_monetary,
          churn_probability = EXCLUDED.churn_probability,
          predicted_clv_paise = EXCLUDED.predicted_clv_paise,
          segment = EXCLUDED.segment,
          last_calculated_at = NOW()
      `, [c.id, chain_id, recency, frequency, monetary, churn_prob, predicted_clv, segment]);
            // Update shortcut
            await client.query(`UPDATE customers SET clv_segment = $1 WHERE id = $2`, [segment, c.id]);
        }
        await client.query('COMMIT');
        return { success: true };
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
async function getCLVSegments(chain_id) {
    const res = await db_1.db.query(`
    SELECT segment, COUNT(id) as count, SUM(rfm_monetary) as total_monetary
    FROM customer_clv_projections
    WHERE chain_id = $1
    GROUP BY segment
  `, [chain_id]);
    return res.rows;
}
async function getAtRiskWhales(chain_id) {
    const res = await db_1.db.query(`
    SELECT c.name, c.phone, p.rfm_monetary, p.churn_probability, p.rfm_recency
    FROM customer_clv_projections p
    JOIN customers c ON c.id = p.customer_id
    WHERE p.chain_id = $1 AND p.segment = 'AT_RISK' AND p.rfm_monetary > 500000
    ORDER BY p.rfm_monetary DESC
  `, [chain_id]);
    return res.rows;
}
