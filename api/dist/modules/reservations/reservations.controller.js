"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBooking = createBooking;
exports.getReservations = getReservations;
exports.updateReservationStatus = updateReservationStatus;
const db_1 = require("../../lib/db");
async function createBooking(req, res) {
    const { outlet_id } = req.params;
    const { customer_name, phone, party_size, reservation_at, notes, source, email } = req.body;
    // 1. Auto-assign a table if enabled
    const settingsRes = await db_1.db.query('SELECT * FROM reservation_settings WHERE outlet_id = $1', [outlet_id]);
    const settings = settingsRes.rows[0];
    let assignedTableId = null;
    if (settings?.auto_assign) {
        const tableRes = await db_1.db.query(`SELECT id FROM tables 
       WHERE outlet_id = $1 AND capacity >= $2 AND status = 'available'
       AND id NOT IN (SELECT table_id FROM reservations WHERE outlet_id = $1 AND status = 'confirmed' AND table_id IS NOT NULL)
       ORDER BY capacity ASC LIMIT 1`, [outlet_id, party_size]);
        if (tableRes.rowCount > 0)
            assignedTableId = tableRes.rows[0].id;
    }
    const result = await db_1.db.query(`INSERT INTO reservations (
       outlet_id, customer_name, phone, party_size, 
       table_id, reservation_at, notes, source, email, status
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'confirmed') RETURNING *`, [
        outlet_id, customer_name, phone, party_size,
        assignedTableId, reservation_at, notes, source || 'web', email, 'confirmed'
    ]);
    res.status(201).json({ success: true, data: result.rows[0] });
}
async function getReservations(req, res) {
    const { outlet_id } = req.params;
    const { date } = req.query;
    const result = await db_1.db.query(`SELECT r.*, t.name as table_name 
     FROM reservations r
     LEFT JOIN tables t ON t.id = r.table_id
     WHERE r.outlet_id = $1 AND (CAST(r.reservation_at AS DATE) = $2 OR $2 IS NULL)
     ORDER BY r.reservation_at ASC`, [outlet_id, date || null]);
    res.json({ success: true, data: result.rows });
}
async function updateReservationStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    const result = await db_1.db.query('UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, id]);
    res.json({ success: true, data: result.rows[0] });
}
