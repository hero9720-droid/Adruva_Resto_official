"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveQR = resolveQR;
const db_1 = require("../../lib/db");
const jwt_1 = require("../../lib/jwt");
const crypto_1 = require("../../lib/crypto");
async function resolveQR(req, res) {
    const { id: rawToken } = req.params;
    try {
        // rawToken can be 'uuid' (legacy) or 'uuid.signature' (hardened)
        const [spaceId] = rawToken.split('.');
        // 1. Check if it's a Table
        const tableRes = await db_1.db.query(`SELECT t.*, o.subdomain, o.id as outlet_id, o.qr_secret 
       FROM tables t 
       JOIN outlets o ON t.outlet_id = o.id 
       WHERE t.id = $1 AND t.is_active = true`, [spaceId]);
        if (tableRes.rows.length > 0) {
            const table = tableRes.rows[0];
            // VERIFY SIGNATURE (if token contains one)
            if (rawToken.includes('.')) {
                const expected = (0, crypto_1.signQR)(table.outlet_id, table.id, table.qr_secret);
                if (expected !== rawToken) {
                    return res.status(403).json({ success: false, error: 'Invalid or expired QR code signature.' });
                }
            }
            // Check for active session
            let sessionRes = await db_1.db.query(`SELECT id FROM table_sessions WHERE table_id = $1 AND closed_at IS NULL ORDER BY created_at DESC LIMIT 1`, [spaceId]);
            let sessionId;
            if (sessionRes.rows.length > 0) {
                sessionId = sessionRes.rows[0].id;
            }
            else {
                // Create new guest session
                const newSession = await db_1.db.query(`INSERT INTO table_sessions (outlet_id, table_id, customer_count) VALUES ($1, $2, 1) RETURNING id`, [table.outlet_id, spaceId]);
                sessionId = newSession.rows[0].id;
            }
            const guestToken = (0, jwt_1.signAccessToken)({
                role: 'guest',
                outlet_id: table.outlet_id,
            });
            return res.json({
                success: true,
                data: {
                    type: 'table',
                    outlet_id: table.outlet_id,
                    outlet_slug: table.subdomain || table.outlet_id,
                    space_id: spaceId,
                    space_name: table.name,
                    session_id: sessionId,
                    guest_token: guestToken
                }
            });
        }
        // 2. Check if it's a Room
        const roomRes = await db_1.db.query(`SELECT r.*, o.subdomain, o.id as outlet_id, o.qr_secret 
       FROM rooms r 
       JOIN outlets o ON r.outlet_id = o.id 
       WHERE r.id = $1 AND r.is_active = true`, [spaceId]);
        if (roomRes.rows.length > 0) {
            const room = roomRes.rows[0];
            // VERIFY SIGNATURE (if token contains one)
            if (rawToken.includes('.')) {
                const expected = (0, crypto_1.signQR)(room.outlet_id, room.id, room.qr_secret);
                if (expected !== rawToken) {
                    return res.status(403).json({ success: false, error: 'Invalid or expired QR code signature.' });
                }
            }
            // Rooms don't use 'table_sessions' in the same way, orders are linked to room_id directly.
            // But we must check if it's occupied to allow ordering.
            if (room.status !== 'occupied') {
                return res.status(403).json({
                    success: false,
                    error: 'Room is not currently checked-in. Please contact the front desk.'
                });
            }
            const guestToken = (0, jwt_1.signAccessToken)({
                role: 'guest',
                outlet_id: room.outlet_id,
            });
            return res.json({
                success: true,
                data: {
                    type: 'room',
                    outlet_id: room.outlet_id,
                    outlet_slug: room.subdomain || room.outlet_id,
                    space_id: spaceId,
                    space_name: room.name,
                    session_id: null, // Orders will link via room_id
                    guest_token: guestToken
                }
            });
        }
        // 3. Not found
        return res.status(404).json({
            success: false,
            error: 'Invalid or deactivated QR code.'
        });
    }
    catch (err) {
        // Check if UUID is malformed (postgres error 22P02)
        if (err.code === '22P02') {
            return res.status(404).json({ success: false, error: 'Invalid QR signature format.' });
        }
        console.error('QR Resolver Error:', err);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
}
