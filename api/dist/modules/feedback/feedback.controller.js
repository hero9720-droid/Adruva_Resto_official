"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitFeedback = submitFeedback;
exports.getOutletFeedback = getOutletFeedback;
exports.getFeedbackStats = getFeedbackStats;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
const db_2 = require("../../lib/db");
const notifications_1 = require("../../lib/notifications");
async function submitFeedback(req, res) {
    const { outlet_id, bill_id, customer_id, rating_food, rating_service, rating_ambience, comment } = req.body;
    if (!outlet_id || !rating_food)
        throw new errors_1.AppError(400, 'Required fields missing', 'VALIDATION_ERROR');
    // Simple Sentiment Analysis Logic (Rule-based for now)
    let sentiment = 'neutral';
    const posWords = ['good', 'great', 'excellent', 'amazing', 'best', 'delicious', 'nice', 'friendly'];
    const negWords = ['bad', 'slow', 'cold', 'worst', 'rude', 'expensive', 'late', 'oily'];
    const text = (comment || '').toLowerCase();
    const posCount = posWords.filter(w => text.includes(w)).length;
    const negCount = negWords.filter(w => text.includes(w)).length;
    const avgRating = (rating_food + (rating_service || 3) + (rating_ambience || 3)) / 3;
    if (avgRating >= 4 || posCount > negCount)
        sentiment = 'positive';
    else if (avgRating <= 2 || negCount > posCount)
        sentiment = 'negative';
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // Fetch outlet name and manager email for the alert
        const outletInfo = await client.query('SELECT name, phone FROM outlets WHERE id = $1', [outlet_id]);
        const outletName = outletInfo.rows[0]?.name || 'Your Restaurant';
        const r = await client.query(`INSERT INTO customer_feedback (outlet_id, bill_id, customer_id, rating_food, rating_service, rating_ambience, comment, sentiment)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [outlet_id, bill_id || null, customer_id || null, rating_food, rating_service || 3, rating_ambience || 3, comment || '', sentiment]);
        // If negative, trigger alert
        if (sentiment === 'negative') {
            const customer = customer_id ? await db_2.db.query('SELECT phone FROM customers WHERE id = $1', [customer_id]) : null;
            // In a real scenario, we'd fetch the manager's email from the staff table
            const managerEmailRes = await client.query("SELECT email FROM staff WHERE outlet_id = $1 AND role = 'outlet_manager' LIMIT 1", [outlet_id]);
            const managerEmail = managerEmailRes.rows[0]?.email;
            (0, notifications_1.sendNegativeReviewAlert)({
                outletName,
                ratingFood: rating_food,
                ratingService: rating_service || 3,
                ratingAmbience: rating_ambience || 3,
                comment: comment || '',
                billId: bill_id,
                customerPhone: customer?.rows[0]?.phone,
                managerEmail
            });
        }
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function getOutletFeedback(req, res) {
    const outlet_id = req.user.outlet_id;
    const { sentiment, rating } = req.query;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        let query = `SELECT f.*, c.name as customer_name FROM customer_feedback f LEFT JOIN customers c ON c.id = f.customer_id WHERE f.outlet_id = $1`;
        const params = [outlet_id];
        if (sentiment) {
            params.push(sentiment);
            query += ` AND f.sentiment = $${params.length}`;
        }
        query += ` ORDER BY f.created_at DESC LIMIT 100`;
        const r = await client.query(query, params);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
async function getFeedbackStats(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const stats = await client.query(`
      SELECT 
        AVG(rating_food)::float as avg_food,
        AVG(rating_service)::float as avg_service,
        AVG(rating_ambience)::float as avg_ambience,
        COUNT(CASE WHEN sentiment = 'positive' THEN 1 END)::int as positive_count,
        COUNT(CASE WHEN sentiment = 'negative' THEN 1 END)::int as negative_count,
        COUNT(id)::int as total_count
      FROM customer_feedback
      WHERE outlet_id = $1
    `, [outlet_id]);
        return stats.rows[0];
    });
    res.json({ success: true, data: result });
}
