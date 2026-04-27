"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLivePnL = getLivePnL;
exports.getFinancialProjections = getFinancialProjections;
const db_1 = require("../../lib/db");
async function getLivePnL(outlet_id, month_offset = 0) {
    const start = new Date();
    start.setMonth(start.getMonth() - month_offset);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    // 1. Total Revenue
    const revRes = await db_1.db.query(`
    SELECT SUM(total_paise) as revenue 
    FROM bills 
    WHERE outlet_id = $1 AND created_at >= $2 AND created_at < $3 AND status = 'paid'
  `, [outlet_id, start, end]);
    // 2. COGS (Ingredients used in orders)
    const cogsRes = await db_1.db.query(`
    SELECT SUM(sm.quantity * sm.unit_cost_paise) as cogs
    FROM stock_movements sm
    WHERE sm.outlet_id = $1 AND sm.type = 'kitchen_use' AND sm.created_at >= $2 AND sm.created_at < $3
  `, [outlet_id, start, end]);
    // 3. Labor Cost (Mocked for now, usually linked to payroll module)
    const laborRes = await db_1.db.query(`
    SELECT SUM(amount_paise) as labor
    FROM expenses
    WHERE outlet_id = $1 AND category = 'salary' AND created_at >= $2 AND created_at < $3
  `, [outlet_id, start, end]);
    // 4. Overheads (Fixed expenses)
    const overheadRes = await db_1.db.query(`
    SELECT SUM(amount_paise) as overheads
    FROM expenses
    WHERE outlet_id = $1 AND expense_type = 'fixed' AND created_at >= $2 AND created_at < $3
  `, [outlet_id, start, end]);
    const revenue = Number(revRes.rows[0].revenue || 0);
    const cogs = Number(cogsRes.rows[0].cogs || 0);
    const labor = Number(laborRes.rows[0].labor || 0);
    const overheads = Number(overheadRes.rows[0].overheads || 0);
    const profit = revenue - cogs - labor - overheads;
    return {
        revenue,
        cogs,
        labor,
        overheads,
        net_profit: profit,
        margin_percent: revenue > 0 ? (profit / revenue) * 100 : 0
    };
}
async function getFinancialProjections(outlet_id) {
    // Logic: Predict revenue based on last 4 weeks same-day average
    const projections = await db_1.db.query(`
    SELECT forecast_date, predicted_revenue_paise, predicted_expense_paise
    FROM financial_projections
    WHERE outlet_id = $1 AND forecast_date >= CURRENT_DATE
    ORDER BY forecast_date ASC
    LIMIT 14
  `, [outlet_id]);
    return projections.rows;
}
