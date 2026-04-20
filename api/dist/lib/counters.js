"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNextOrderNumber = getNextOrderNumber;
exports.getNextBillNumber = getNextBillNumber;
/**
 * Generates an atomic order number for an outlet.
 * Format: ORD-00001
 */
async function getNextOrderNumber(client, outlet_id) {
    const result = await client.query(`INSERT INTO outlet_counters (outlet_id, order_count, bill_count)
     VALUES ($1, 1, 0)
     ON CONFLICT (outlet_id) DO UPDATE 
     SET order_count = outlet_counters.order_count + 1 
     RETURNING order_count`, [outlet_id]);
    const count = result.rows[0].order_count;
    return `ORD-${count.toString().padStart(5, '0')}`;
}
async function getNextBillNumber(client, outlet_id) {
    const result = await client.query(`INSERT INTO outlet_counters (outlet_id, order_count, bill_count)
     VALUES ($1, 0, 1)
     ON CONFLICT (outlet_id) DO UPDATE 
     SET bill_count = outlet_counters.bill_count + 1 
     RETURNING bill_count`, [outlet_id]);
    const count = result.rows[0].bill_count;
    return `BILL-${count.toString().padStart(5, '0')}`;
}
