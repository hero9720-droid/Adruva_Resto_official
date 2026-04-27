"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLeave = requestLeave;
exports.updateLeaveStatus = updateLeaveStatus;
exports.getLeaveRequests = getLeaveRequests;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
async function requestLeave(req, res) {
    const outlet_id = req.user.outlet_id;
    const staff_id = req.user.staff_id;
    const { start_date, end_date, reason, type } = req.body;
    if (!start_date || !end_date)
        throw new errors_1.AppError(400, 'Dates are required', 'VALIDATION_ERROR');
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`INSERT INTO leave_requests (outlet_id, staff_id, start_date, end_date, reason, type, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`, [outlet_id, staff_id, start_date, end_date, reason, type || 'sick']);
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function updateLeaveStatus(req, res) {
    const outlet_id = req.user.outlet_id;
    const { id } = req.params;
    const { status, manager_notes } = req.body; // approved, rejected
    if (!['approved', 'rejected'].includes(status))
        throw new errors_1.AppError(400, 'Invalid status', 'VALIDATION_ERROR');
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`UPDATE leave_requests
       SET status = $1, 
           manager_notes = $2, 
           updated_at = NOW()
       WHERE id = $3 AND outlet_id = $4
       RETURNING *`, [status, manager_notes, id, outlet_id]);
        if (r.rowCount === 0)
            throw new errors_1.AppError(404, 'Leave request not found', 'NOT_FOUND');
        return r.rows[0];
    });
    res.json({ success: true, data: result });
}
async function getLeaveRequests(req, res) {
    const outlet_id = req.user.outlet_id;
    const { staff_id, status } = req.query;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        let query = `
      SELECT lr.*, s.name as staff_name, s.role
      FROM leave_requests lr
      JOIN staff s ON s.id = lr.staff_id
      WHERE lr.outlet_id = $1
    `;
        const params = [outlet_id];
        if (staff_id) {
            params.push(staff_id);
            query += ` AND lr.staff_id = $${params.length}`;
        }
        if (status) {
            params.push(status);
            query += ` AND lr.status = $${params.length}`;
        }
        query += ' ORDER BY lr.created_at DESC';
        const r = await client.query(query, params);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
