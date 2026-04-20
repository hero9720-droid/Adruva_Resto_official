"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservation = createReservation;
exports.getReservations = getReservations;
exports.updateStatus = updateStatus;
exports.createPublicReservation = createPublicReservation;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
async function createReservation(req, res) {
    const outlet_id = req.user.outlet_id;
    const chain_id = req.user.chain_id;
    // DB schema: customer_name, phone, party_size, table_id, reservation_at, notes, status
    const { customer_name, phone, party_size, table_id, reservation_at, notes } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // Check table availability (within ±2 hours)
        if (table_id) {
            const conflict = await client.query(`
        SELECT id FROM reservations
        WHERE table_id = $1
          AND status IN ('pending', 'confirmed')
          AND reservation_at BETWEEN $2::timestamptz - INTERVAL '2 hours'
                                 AND $2::timestamptz + INTERVAL '2 hours'
      `, [table_id, reservation_at]);
            if ((conflict.rowCount ?? 0) > 0) {
                throw new errors_1.AppError(400, 'Table already booked for this time slot', 'TABLE_CONFLICT');
            }
        }
        // Create reservation (exact DB columns)
        const r = await client.query(`INSERT INTO reservations (outlet_id, customer_name, phone, party_size, table_id, reservation_at, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`, [outlet_id, customer_name, phone, party_size || 2, table_id, reservation_at, notes]);
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function getReservations(req, res) {
    const outlet_id = req.user.outlet_id;
    const { date, status } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const params = [outlet_id, targetDate];
        let query = `
      SELECT r.*, t.name as table_name
      FROM reservations r
      LEFT JOIN tables t ON t.id = r.table_id
      WHERE r.outlet_id = $1
        AND DATE(r.reservation_at) = $2
    `;
        if (status) {
            params.push(status);
            query += ` AND r.status = $${params.length}`;
        }
        query += ' ORDER BY r.reservation_at ASC';
        const r = await client.query(query, params);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
async function updateStatus(req, res) {
    const { id } = req.params;
    const outlet_id = req.user.outlet_id;
    const { status } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query('UPDATE reservations SET status = $1 WHERE id = $2 AND outlet_id = $3 RETURNING *', [status, id, outlet_id]);
        if ((r.rowCount ?? 0) === 0)
            throw new errors_1.AppError(404, 'Reservation not found', 'NOT_FOUND');
        const reservation = r.rows[0];
        // If confirmed/arrived, mark table reserved
        if (status === 'confirmed' && reservation.table_id) {
            await client.query(`UPDATE tables SET status = 'reserved' WHERE id = $1`, [reservation.table_id]);
        }
        // If cancelled/no_show, free the table
        if ((status === 'cancelled' || status === 'no_show') && reservation.table_id) {
            await client.query(`UPDATE tables SET status = 'available' WHERE id = $1`, [reservation.table_id]);
        }
        return reservation;
    });
    res.json({ success: true, data: result });
}
async function createPublicReservation(req, res) {
    const { outlet_id, customer_name, phone, party_size, reservation_at, notes } = req.body;
    if (!outlet_id)
        throw new errors_1.AppError(400, 'outlet_id is required', 'INVALID_INPUT');
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // Public reservations usually don't pick a table, staff assigns later.
        // But we record the request.
        const r = await client.query(`INSERT INTO reservations (outlet_id, customer_name, phone, party_size, reservation_at, notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'confirmed') RETURNING *`, [outlet_id, customer_name, phone, party_size || 2, reservation_at, notes]);
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
