"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initiateApproval = initiateApproval;
exports.processDecision = processDecision;
exports.getPendingApprovals = getPendingApprovals;
const db_1 = require("../../lib/db");
async function initiateApproval(outlet_id, type, reference_id, amount_paise, requested_by) {
    // 1. Check if a workflow exists for this trigger and threshold
    const workflowRes = await db_1.db.query(`
    SELECT * FROM approval_workflows 
    WHERE outlet_id = $1 AND trigger_type = $2 AND threshold_paise <= $3 AND is_active = TRUE
    ORDER BY threshold_paise DESC LIMIT 1
  `, [outlet_id, type, amount_paise]);
    if (workflowRes.rows.length === 0) {
        return { status: 'approved' }; // No approval needed
    }
    // 2. Create approval request
    await db_1.db.query(`
    INSERT INTO approval_requests (outlet_id, type, reference_id, requested_by, status)
    VALUES ($1, $2, $3, $4, 'pending')
  `, [outlet_id, type, reference_id, requested_by]);
    return { status: 'pending_approval' };
}
async function processDecision(request_id, staff_id, decision, comments) {
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        // 1. Update Request
        const reqRes = await client.query(`
      UPDATE approval_requests 
      SET status = $1, decided_by = $2, decided_at = NOW(), comments = $3
      WHERE id = $4 RETURNING *
    `, [decision, staff_id, comments, request_id]);
        const request = reqRes.rows[0];
        // 2. Update Source Record
        const tableMap = {
            'expense': 'expenses',
            'purchase_order': 'purchase_orders'
        };
        const tableName = tableMap[request.type];
        if (tableName) {
            await client.query(`
        UPDATE ${tableName} SET approval_status = $1 WHERE id = $2
      `, [decision === 'approved' ? 'approved' : 'rejected', request.reference_id]);
        }
        await client.query('COMMIT');
        return request;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
async function getPendingApprovals(outlet_id) {
    const res = await db_1.db.query(`
    SELECT ar.*, s.name as requested_by_name
    FROM approval_requests ar
    JOIN staff s ON s.id = ar.requested_by
    WHERE ar.outlet_id = $1 AND ar.status = 'pending'
    ORDER BY ar.created_at DESC
  `, [outlet_id]);
    return res.rows;
}
