"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutletSettings = getOutletSettings;
exports.updateOutletSettings = updateOutletSettings;
exports.getTables = getTables;
exports.createTable = createTable;
exports.updateTable = updateTable;
exports.getZones = getZones;
exports.createZone = createZone;
exports.getZoneTables = getZoneTables;
const db_1 = require("../../lib/db");
async function getOutletSettings(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`SELECT id, name, subdomain, address, phone, email, gstin,
              tax_rate_percent, service_charge_percent,
              currency, timezone, logo_url, created_at
       FROM outlets WHERE id = $1`, [outlet_id]);
        return r.rows[0];
    });
    res.json({ success: true, data: result });
}
async function updateOutletSettings(req, res) {
    const outlet_id = req.user.outlet_id;
    // Only allow safe fields to be updated
    const allowed = [
        'name', 'address', 'phone', 'email', 'gstin',
        'tax_rate_percent', 'service_charge_percent',
        'currency', 'timezone', 'logo_url',
        'gst_percentage', 'service_charge_percentage' // Added for frontend compatibility
    ];
    const body = req.body;
    // Handle nested settings_tax from frontend if present
    if (body.settings_tax) {
        body.tax_rate_percent = body.settings_tax.gst_percentage;
        body.service_charge_percent = body.settings_tax.service_charge_percentage;
    }
    const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));
    // Map frontend names to DB names
    if (updates.gst_percentage !== undefined) {
        updates.tax_rate_percent = updates.gst_percentage;
        delete updates.gst_percentage;
    }
    if (updates.service_charge_percentage !== undefined) {
        updates.service_charge_percent = updates.service_charge_percentage;
        delete updates.service_charge_percentage;
    }
    if (Object.keys(updates).length === 0) {
        return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`UPDATE outlets SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`, [outlet_id, ...values]);
        return r.rows[0];
    });
    res.json({ success: true, data: result });
}
// Tables management (replaces floor_zones — zones don't exist in DB)
async function getTables(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`SELECT id, name, capacity, status, pos_x, pos_y, shape, width, height, is_active, assigned_waiter_id
       FROM tables WHERE outlet_id = $1 AND is_active = true ORDER BY name ASC`, [outlet_id]);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
async function createTable(req, res) {
    const outlet_id = req.user.outlet_id;
    const { name, capacity = 4, pos_x = 0, pos_y = 0, shape = 'rectangle' } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`INSERT INTO tables (outlet_id, name, capacity, status, pos_x, pos_y, shape)
       VALUES ($1, $2, $3, 'available', $4, $5, $6) RETURNING *`, [outlet_id, name, capacity, pos_x, pos_y, shape]);
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function updateTable(req, res) {
    const outlet_id = req.user.outlet_id;
    const { id } = req.params;
    const allowed = ['name', 'capacity', 'pos_x', 'pos_y', 'shape', 'status', 'is_active', 'width', 'height'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const setClause = fields.map((f, i) => `${f} = $${i + 3}`).join(', ');
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`UPDATE tables SET ${setClause} WHERE id = $1 AND outlet_id = $2 RETURNING *`, [id, outlet_id, ...values]);
        return r.rows[0];
    });
    res.json({ success: true, data: result });
}
// Legacy zone endpoints (not used — floor_zones not in DB)
async function getZones(req, res) {
    res.json({ success: true, data: [], message: 'Floor zones not configured. Use tables management.' });
}
async function createZone(req, res) {
    res.status(501).json({ success: false, message: 'Floor zones not available in current schema' });
}
async function getZoneTables(req, res) {
    return getTables(req, res);
}
