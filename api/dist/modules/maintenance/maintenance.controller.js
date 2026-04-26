"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAsset = createAsset;
exports.getAssets = getAssets;
exports.reportIncident = reportIncident;
exports.getIncidents = getIncidents;
exports.resolveIncident = resolveIncident;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
// --- ASSETS ---
async function createAsset(req, res) {
    const outlet_id = req.user.outlet_id;
    const { name, category, serial_number, purchase_date, warranty_expiry } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`INSERT INTO assets (outlet_id, name, category, serial_number, purchase_date, warranty_expiry)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [outlet_id, name, category, serial_number, purchase_date, warranty_expiry]);
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function getAssets(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query('SELECT * FROM assets WHERE outlet_id = $1 ORDER BY name ASC', [outlet_id]);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
// --- INCIDENTS ---
async function reportIncident(req, res) {
    const outlet_id = req.user.outlet_id;
    const staff_id = req.user.staff_id;
    const { asset_id, title, description, priority } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`INSERT INTO incidents (outlet_id, asset_id, reported_by, title, description, priority)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [outlet_id, asset_id || null, staff_id, title, description, priority || 'medium']);
        // If critical, update asset status
        if (priority === 'critical' && asset_id) {
            await client.query("UPDATE assets SET status = 'broken' WHERE id = $1", [asset_id]);
        }
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function getIncidents(req, res) {
    const outlet_id = req.user.outlet_id;
    const { status } = req.query;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        let query = `
      SELECT i.*, a.name as asset_name, s.name as reporter_name
      FROM incidents i
      LEFT JOIN assets a ON a.id = i.asset_id
      LEFT JOIN staff s ON s.id = i.reported_by
      WHERE i.outlet_id = $1
    `;
        const params = [outlet_id];
        if (status) {
            params.push(status);
            query += ` AND i.status = $${params.length}`;
        }
        query += ' ORDER BY i.created_at DESC';
        const r = await client.query(query, params);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
async function resolveIncident(req, res) {
    const { id } = req.params;
    const outlet_id = req.user.outlet_id;
    const { cost_paise, status = 'resolved' } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`UPDATE incidents 
       SET status = $1, cost_paise = $2, resolved_at = NOW(), updated_at = NOW() 
       WHERE id = $3 AND outlet_id = $4 RETURNING *`, [status, cost_paise || 0, id, outlet_id]);
        if (r.rowCount === 0)
            throw new errors_1.AppError(404, 'Incident not found', 'NOT_FOUND');
        // If resolved and linked to asset, reset asset status
        if (status === 'resolved' && r.rows[0].asset_id) {
            await client.query("UPDATE assets SET status = 'active' WHERE id = $1", [r.rows[0].asset_id]);
        }
        return r.rows[0];
    });
    res.json({ success: true, data: result });
}
