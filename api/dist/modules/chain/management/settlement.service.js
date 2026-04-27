"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMonthlySettlement = calculateMonthlySettlement;
exports.getChainSettlementSummary = getChainSettlementSummary;
const db_1 = require("../../../lib/db");
async function calculateMonthlySettlement(outlet_id, period) {
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        // 1. Get Outlet Config
        const outletRes = await client.query(`SELECT royalty_percentage, fixed_monthly_fee_paise, chain_id FROM outlets WHERE id = $1`, [outlet_id]);
        const outlet = outletRes.rows[0];
        // 2. Sum Gross Revenue for the period
        const salesRes = await client.query(`
      SELECT SUM(total_paise) as total 
      FROM bills 
      WHERE outlet_id = $1 AND TO_CHAR(created_at, 'YYYY-MM') = $2 AND status = 'paid'
    `, [outlet_id, period]);
        const grossSales = Number(salesRes.rows[0].total || 0);
        // 3. Sum Adjustments (Shared costs)
        const adjRes = await client.query(`
      SELECT SUM(amount_paise) as total 
      FROM franchise_settlement_adjustments 
      WHERE outlet_id = $1 AND period_month = $2
    `, [outlet_id, period]);
        const adjustments = Number(adjRes.rows[0].total || 0);
        // 4. Calculate Royalty
        const royalty = Math.round(grossSales * (Number(outlet.royalty_percentage) / 100));
        const fixedFee = Number(outlet.fixed_monthly_fee_paise || 0);
        const netSettlement = grossSales - royalty - fixedFee - adjustments;
        // 5. Create/Update Invoice record
        await client.query(`
      INSERT INTO franchise_royalty_invoices 
      (chain_id, outlet_id, invoice_number, period_month, total_sales_paise, royalty_amount_paise, fixed_fee_paise, adjustments_total_paise, net_payout_paise)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (invoice_number) DO UPDATE SET
        total_sales_paise = EXCLUDED.total_sales_paise,
        royalty_amount_paise = EXCLUDED.royalty_amount_paise,
        net_payout_paise = EXCLUDED.net_payout_paise
    `, [
            outlet.chain_id,
            outlet_id,
            `INV-${outlet_id.slice(0, 4)}-${period}`,
            period,
            grossSales,
            royalty,
            fixedFee,
            adjustments,
            netSettlement
        ]);
        await client.query('COMMIT');
        return { grossSales, royalty, fixedFee, adjustments, netSettlement };
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
async function getChainSettlementSummary(chain_id, period) {
    const res = await db_1.db.query(`
    SELECT i.*, o.name as outlet_name 
    FROM franchise_royalty_invoices i
    JOIN outlets o ON o.id = i.outlet_id
    WHERE i.chain_id = $1 AND i.period_month = $2
  `, [chain_id, period]);
    return res.rows;
}
