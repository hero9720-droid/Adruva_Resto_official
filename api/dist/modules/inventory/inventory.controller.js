"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIngredient = createIngredient;
exports.getIngredients = getIngredients;
exports.getLowStockIngredients = getLowStockIngredients;
exports.recordMovement = recordMovement;
exports.getMovements = getMovements;
exports.createSupplier = createSupplier;
exports.getSuppliers = getSuppliers;
const db_1 = require("../../lib/db");
// --- INGREDIENTS ---
async function createIngredient(req, res) {
    const outlet_id = req.user.outlet_id;
    // DB schema: category(text), unit, current_stock, low_threshold, avg_cost_paise
    const { name, category, unit, current_stock = 0, low_threshold = 0, avg_cost_paise = 0 } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`INSERT INTO ingredients (outlet_id, name, category, unit, current_stock, low_threshold, avg_cost_paise)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [outlet_id, name, category, unit, current_stock, low_threshold, avg_cost_paise]);
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function getIngredients(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`SELECT * FROM ingredients 
       WHERE outlet_id = $1 AND is_active = true 
       ORDER BY category ASC, name ASC`, [outlet_id]);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
async function getLowStockIngredients(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`SELECT * FROM ingredients 
       WHERE outlet_id = $1 AND is_active = true AND current_stock <= low_threshold
       ORDER BY current_stock ASC`, [outlet_id]);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
// --- STOCK MOVEMENTS ---
async function recordMovement(req, res) {
    const outlet_id = req.user.outlet_id;
    const staff_id = req.user.staff_id;
    // DB schema: type, quantity, unit_cost_paise, total_cost_paise, reference_id, created_by
    const { ingredient_id, type, quantity, unit_cost_paise = 0 } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const total_cost_paise = unit_cost_paise * quantity;
        const moveRes = await client.query(`INSERT INTO stock_movements (outlet_id, ingredient_id, type, quantity, unit_cost_paise, total_cost_paise, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [outlet_id, ingredient_id, type, quantity, unit_cost_paise, total_cost_paise, staff_id]);
        // Update stock: purchase/return → add, waste/kitchen_use/adjustment_down → subtract
        const delta = (type === 'purchase' || type === 'return') ? quantity : -quantity;
        await client.query('UPDATE ingredients SET current_stock = current_stock + $1, last_restocked_at = CASE WHEN $2 > 0 THEN NOW() ELSE last_restocked_at END WHERE id = $3', [delta, delta, ingredient_id]);
        return moveRes.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function getMovements(req, res) {
    const outlet_id = req.user.outlet_id;
    const { ingredient_id } = req.query;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const params = [outlet_id];
        let query = `
      SELECT sm.*, i.name as ingredient_name, s.name as staff_name
      FROM stock_movements sm
      JOIN ingredients i ON i.id = sm.ingredient_id
      LEFT JOIN staff s ON s.id = sm.created_by
      WHERE sm.outlet_id = $1
    `;
        if (ingredient_id) {
            params.push(ingredient_id);
            query += ` AND sm.ingredient_id = $${params.length}`;
        }
        query += ' ORDER BY sm.created_at DESC LIMIT 100';
        const r = await client.query(query, params);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
// --- SUPPLIERS ---
async function createSupplier(req, res) {
    const outlet_id = req.user.outlet_id;
    const { name, contact_person, email, phone, address, gstin } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`INSERT INTO suppliers (outlet_id, name, contact_person, email, phone, address, gstin)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [outlet_id, name, contact_person, email, phone, address, gstin]);
        return r.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function getSuppliers(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query('SELECT * FROM suppliers WHERE outlet_id = $1 ORDER BY name ASC', [outlet_id]);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
