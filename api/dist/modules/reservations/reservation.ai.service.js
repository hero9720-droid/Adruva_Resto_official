"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.predictTableAvailability = predictTableAvailability;
exports.processSmartBooking = processSmartBooking;
const db_1 = require("../../lib/db");
async function predictTableAvailability(outlet_id) {
    // Logic: Analyze current session status
    // 1. If only drinks ordered -> 45 mins left
    // 2. If main course served -> 20 mins left
    // 3. If check requested -> 5 mins left
    const tables = await db_1.db.query(`
    SELECT t.id, t.name, t.status, ts.id as session_id,
           COALESCE(
             (SELECT MAX(created_at) FROM orders WHERE session_id = ts.id),
             ts.created_at
           ) as last_activity
    FROM tables t
    LEFT JOIN table_sessions ts ON ts.table_id = t.id AND ts.closed_at IS NULL
    WHERE t.outlet_id = $1 AND t.is_active = TRUE
  `, [outlet_id]);
    const predictions = tables.rows.map(table => {
        let timeLeft = 0;
        if (table.status === 'occupied') {
            const elapsed = (Date.now() - new Date(table.last_activity).getTime()) / 60000;
            timeLeft = Math.max(5, 60 - elapsed); // Simple linear decay for now
        }
        return { ...table, predicted_minutes_left: Math.round(timeLeft) };
    });
    return predictions;
}
async function processSmartBooking(outlet_id, data) {
    const { customer_id, party_size, reservation_at } = data;
    // 1. Check VIP Status
    const customer = await db_1.db.query(`SELECT lifetime_spend_paise FROM customers WHERE id = $1`, [customer_id]);
    const is_vip = (customer.rows[0]?.lifetime_spend_paise || 0) > 500000; // > ₹5000 spend
    // 2. Auto-generate confirmation code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const res = await db_1.db.query(`
    INSERT INTO reservations (outlet_id, customer_id, party_size, reservation_at, is_vip, confirmation_code, status)
    VALUES ($1, $2, $3, $4, $5, $6, 'confirmed')
    RETURNING *
  `, [outlet_id, customer_id, party_size, reservation_at, is_vip, code]);
    if (is_vip) {
        await db_1.db.query(`
      INSERT INTO vip_alerts (outlet_id, customer_id, message)
      VALUES ($1, $2, $3)
    `, [outlet_id, customer_id, `VIP Guest ${data.customer_name} booked for ${reservation_at}`]);
    }
    return res.rows[0];
}
