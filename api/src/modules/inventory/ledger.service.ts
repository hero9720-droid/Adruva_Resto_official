import { db } from '../../lib/db';

export async function logStockMovement(data: {
  outlet_id: string;
  ingredient_id: string;
  staff_id: string;
  type: string;
  delta: number;
  reference_id?: string;
  reason_code?: string;
  notes?: string;
}) {
  const { outlet_id, ingredient_id, staff_id, type, delta, reference_id, reason_code, notes } = data;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Get Current Balance
    const balRes = await client.query(`SELECT current_stock FROM ingredients WHERE id = $1 FOR UPDATE`, [ingredient_id]);
    const currentBal = Number(balRes.rows[0]?.current_stock || 0);
    const newBal = currentBal + delta;

    // 2. Update Ingredient Stock
    await client.query(`UPDATE ingredients SET current_stock = $1 WHERE id = $2`, [newBal, ingredient_id]);

    // 3. Log to Immutable Ledger
    const result = await client.query(`
      INSERT INTO inventory_ledger (outlet_id, ingredient_id, staff_id, type, quantity_delta, balance_after, reference_id, reason_code, notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [outlet_id, ingredient_id, staff_id, type, delta, newBal, reference_id, reason_code, notes]);

    await client.query('COMMIT');
    return result.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getAuditTrail(ingredient_id: string, limit: number = 50) {
  const res = await db.query(`
    SELECT l.*, s.name as staff_name
    FROM inventory_ledger l
    LEFT JOIN staff s ON s.id = l.staff_id
    WHERE l.ingredient_id = $1
    ORDER BY l.created_at DESC
    LIMIT $2
  `, [ingredient_id, limit]);
  return res.rows;
}

export async function reconcileStock(outlet_id: string, staff_id: string, physicalCounts: any[]) {
  // Logic: Create an audit session and log adjustments
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    const auditRes = await client.query(`
      INSERT INTO inventory_audits (outlet_id, conducted_by, status)
      VALUES ($1, $2, 'reconciled') RETURNING id
    `, [outlet_id, staff_id]);
    const audit_id = auditRes.rows[0].id;

    for (const item of physicalCounts) {
      const { ingredient_id, physical_qty } = item;
      
      const balRes = await client.query(`SELECT current_stock, name FROM ingredients WHERE id = $1`, [ingredient_id]);
      const systemQty = Number(balRes.rows[0].current_stock);
      const delta = physical_qty - systemQty;

      if (delta !== 0) {
        await logStockMovement({
          outlet_id,
          ingredient_id,
          staff_id,
          type: 'audit_adjust',
          delta,
          reference_id: audit_id,
          reason_code: 'inventory_audit'
        });
      }

      await client.query(`
        INSERT INTO inventory_audit_items (audit_id, ingredient_id, system_qty, physical_qty, discrepancy_qty)
        VALUES ($1, $2, $3, $4, $5)
      `, [audit_id, ingredient_id, systemQty, physical_qty, delta]);
    }

    await client.query('COMMIT');
    return { audit_id };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
