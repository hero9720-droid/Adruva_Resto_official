"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequisition = createRequisition;
exports.getRequisitions = getRequisitions;
exports.updateRequisitionStatus = updateRequisitionStatus;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
async function createRequisition(req, res) {
    const { from_outlet_id, to_outlet_id, items, priority = 'normal', notes } = req.body;
    const chain_id = req.user.chain_id;
    const staff_id = req.user.staff_id;
    const result = await db_1.db.query(`INSERT INTO stock_requisitions (chain_id, from_outlet_id, to_outlet_id, items, priority, notes, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [chain_id, from_outlet_id, to_outlet_id, JSON.stringify(items), priority, notes, staff_id]);
    res.status(201).json({ success: true, data: result.rows[0] });
}
async function getRequisitions(req, res) {
    const { outlet_id } = req.query; // If provided, filter by specific outlet
    const chain_id = req.user.chain_id;
    let query = `
    SELECT sr.*, 
           fo.name as from_outlet_name, 
           to_o.name as to_outlet_name,
           s.name as creator_name
    FROM stock_requisitions sr
    JOIN outlets fo ON fo.id = sr.from_outlet_id
    JOIN outlets to_o ON to_o.id = sr.to_outlet_id
    LEFT JOIN staff s ON s.id = sr.created_by
    WHERE sr.chain_id = $1
  `;
    const params = [chain_id];
    if (outlet_id) {
        params.push(outlet_id);
        query += ` AND (sr.from_outlet_id = $2 OR sr.to_outlet_id = $2)`;
    }
    query += ' ORDER BY sr.created_at DESC';
    const result = await db_1.db.query(query, params);
    res.json({ success: true, data: result.rows });
}
async function updateRequisitionStatus(req, res) {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;
    const staff_id = req.user.staff_id;
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        const current = await client.query('SELECT * FROM stock_requisitions WHERE id = $1 FOR UPDATE', [id]);
        if (current.rowCount === 0)
            throw new errors_1.AppError(404, 'Requisition not found', 'NOT_FOUND');
        const requisition = current.rows[0];
        // Business Logic: If status becomes 'received', adjust stock in both outlets
        if (status === 'received' && requisition.status !== 'received') {
            const items = requisition.items;
            for (const item of items) {
                // Deduct from source (Kitchen/Warehouse)
                await client.query('UPDATE ingredients SET current_stock = current_stock - $1 WHERE id = $2 AND outlet_id = $3', [item.quantity, item.ingredient_id, requisition.to_outlet_id]);
                // Add to destination (Store)
                // We match by name for multi-outlet portability if IDs differ
                const sourceIng = await client.query('SELECT name FROM ingredients WHERE id = $1', [item.ingredient_id]);
                const ingName = sourceIng.rows[0].name;
                await client.query('UPDATE ingredients SET current_stock = current_stock + $1 WHERE name = $2 AND outlet_id = $3', [item.quantity, ingName, requisition.from_outlet_id]);
                // Log movements
                await client.query(`INSERT INTO stock_movements (outlet_id, ingredient_id, type, quantity, notes)
           VALUES ($1, $2, 'transfer_out', $3, $4)`, [requisition.to_outlet_id, item.ingredient_id, item.quantity, `Requisition #${id} shipped to ${requisition.from_outlet_id}`]);
            }
        }
        const updated = await client.query(`UPDATE stock_requisitions 
       SET status = $1, processed_by = $2, rejection_reason = $3, updated_at = NOW() 
       WHERE id = $4 RETURNING *`, [status, staff_id, rejection_reason || null, id]);
        await client.query('COMMIT');
        res.json({ success: true, data: updated.rows[0] });
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
    }
}
