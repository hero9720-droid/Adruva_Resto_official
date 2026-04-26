"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPredictiveAnalysis = runPredictiveAnalysis;
exports.getProcurementPlan = getProcurementPlan;
exports.getForecastSummary = getForecastSummary;
const db_1 = require("../../lib/db");
async function runPredictiveAnalysis(req, res) {
    const { outlet_id } = req.params;
    // 1. Fetch Sales History (Last 30 Days)
    const history = await db_1.db.query(`SELECT menu_item_id, name, SUM(quantity) as total_qty
     FROM order_items
     WHERE outlet_id = $1 AND created_at > NOW() - INTERVAL '30 days'
     GROUP BY menu_item_id, name`, [outlet_id]);
    const predictions = [];
    const now = new Date();
    for (const item of history.rows) {
        // Basic AI Model: Simple Moving Average + 10% Growth Buffer
        const dailyAvg = Number(item.total_qty) / 30;
        for (let i = 1; i <= 7; i++) {
            const predictedDate = new Date(now);
            predictedDate.setDate(now.getDate() + i);
            // Add "Weekend Surge" factor
            const isWeekend = predictedDate.getDay() === 0 || predictedDate.getDay() === 6;
            const surgeFactor = isWeekend ? 1.4 : 1.0;
            const predictedQty = Math.ceil(dailyAvg * surgeFactor * 1.1);
            predictions.push({
                outlet_id,
                item_type: 'menu_item',
                target_id: item.menu_item_id,
                predicted_date: predictedDate.toISOString().split('T')[0],
                predicted_quantity: predictedQty,
                analysis_basis: 'moving_average'
            });
        }
    }
    // 2. Clear old forecasts and Save new ones
    await db_1.db.query('DELETE FROM demand_forecasts WHERE outlet_id = $1 AND predicted_date >= CURRENT_DATE', [outlet_id]);
    for (const p of predictions) {
        await db_1.db.query(`INSERT INTO demand_forecasts (outlet_id, item_type, target_id, predicted_date, predicted_quantity, analysis_basis)
       VALUES ($1, $2, $3, $4, $5, $6)`, [p.outlet_id, p.item_type, p.target_id, p.predicted_date, p.predicted_quantity, p.analysis_basis]);
    }
    res.json({ success: true, message: `Generated demand forecast for ${history.rowCount} items.` });
}
async function getProcurementPlan(req, res) {
    const { outlet_id } = req.params;
    // Map Forecasted Menu Items -> Ingredients via Recipes
    const result = await db_1.db.query(`SELECT 
       i.name as ingredient_name,
       i.unit,
       i.current_stock,
       SUM(df.predicted_quantity * ri.quantity) as required_stock,
       SUM(df.predicted_quantity * ri.quantity) - i.current_stock as purchase_needed
     FROM demand_forecasts df
     JOIN recipe_ingredients ri ON ri.menu_item_id = df.target_id
     JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE df.outlet_id = $1 AND df.predicted_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
     GROUP BY i.id, i.name, i.unit, i.current_stock
     HAVING SUM(df.predicted_quantity * ri.quantity) > i.current_stock`, [outlet_id]);
    res.json({ success: true, data: result.rows });
}
async function getForecastSummary(req, res) {
    const { outlet_id } = req.params;
    const result = await db_1.db.query(`SELECT df.*, mi.name as item_name
     FROM demand_forecasts df
     JOIN menu_items mi ON mi.id = df.target_id
     WHERE df.outlet_id = $1 AND df.predicted_date >= CURRENT_DATE
     ORDER BY df.predicted_date ASC`, [outlet_id]);
    res.json({ success: true, data: result.rows });
}
