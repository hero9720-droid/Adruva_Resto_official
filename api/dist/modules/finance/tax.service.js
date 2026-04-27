"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTaxesForBill = calculateTaxesForBill;
exports.getTaxSummaryReport = getTaxSummaryReport;
const db_1 = require("../../lib/db");
async function calculateTaxesForBill(outlet_id, subtotal, items) {
    // 1. Get tax slabs for this outlet
    const slabsRes = await db_1.db.query(`SELECT * FROM tax_slabs WHERE outlet_id = $1 AND is_active = TRUE`, [outlet_id]);
    const slabs = slabsRes.rows;
    // 2. Map items to their slabs and calculate
    let totalTax = 0;
    const breakdown = [];
    // Group items by tax slab
    const itemsBySlab = {};
    items.forEach(item => {
        const slabId = item.tax_slab_id || 'default';
        itemsBySlab[slabId] = (itemsBySlab[slabId] || 0) + (item.price * item.quantity);
    });
    for (const slabId in itemsBySlab) {
        const slab = slabs.find(s => s.id === slabId);
        if (slab) {
            const amount = Math.round(itemsBySlab[slabId] * (Number(slab.percentage) / 100));
            totalTax += amount;
            breakdown.push({
                name: slab.name,
                percentage: slab.percentage,
                amount_paise: amount
            });
        }
    }
    return { totalTax, breakdown };
}
async function getTaxSummaryReport(outlet_id, startDate, endDate) {
    const bills = await db_1.db.query(`
    SELECT 
      tax_breakdown,
      total_tax_paise,
      subtotal_paise,
      total_paise
    FROM bills
    WHERE outlet_id = $1 AND created_at BETWEEN $2 AND $3 AND status = 'paid'
  `, [outlet_id, startDate, endDate]);
    // Aggregate breakdown
    const aggregated = {};
    bills.rows.forEach(bill => {
        const breakdown = bill.tax_breakdown || [];
        breakdown.forEach((tax) => {
            aggregated[tax.name] = (aggregated[tax.name] || 0) + tax.amount_paise;
        });
    });
    return {
        total_tax_collected: bills.rows.reduce((acc, b) => acc + b.total_tax_paise, 0),
        breakdown: aggregated,
        bill_count: bills.rowCount
    };
}
