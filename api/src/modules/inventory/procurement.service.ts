import { db } from '../../lib/db';

export async function getProcurementSuggestions(outlet_id: string) {
  // Find ingredients below reorder level
  const res = await db.query(`
    SELECT 
      i.id, 
      i.name, 
      i.current_stock, 
      i.reorder_level, 
      i.reorder_quantity, 
      i.avg_cost_paise,
      i.preferred_supplier_id,
      s.name as supplier_name
    FROM ingredients i
    LEFT JOIN suppliers s ON s.id = i.preferred_supplier_id
    WHERE i.outlet_id = $1 
      AND i.is_active = TRUE 
      AND i.current_stock <= i.reorder_level
      AND i.reorder_quantity > 0
  `, [outlet_id]);

  return res.rows;
}

export async function generateAutoPOs(outlet_id: string, staff_id: string) {
  const suggestions = await getProcurementSuggestions(outlet_id);
  if (suggestions.length === 0) return { createdCount: 0 };

  // Group by supplier
  const bySupplier: Record<string, any[]> = {};
  suggestions.forEach(s => {
    const sid = s.preferred_supplier_id || 'unassigned';
    if (!bySupplier[sid]) bySupplier[sid] = [];
    bySupplier[sid].push(s);
  });

  let poCount = 0;
  for (const [supplierId, items] of Object.entries(bySupplier)) {
    if (supplierId === 'unassigned') continue;

    // Create PO
    const poRes = await db.query(`
      INSERT INTO purchase_orders (outlet_id, supplier_id, po_number, status, created_by, is_automated)
      VALUES ($1, $2, $3, 'pending', $4, TRUE)
      RETURNING id
    `, [outlet_id, supplierId, `AUTO-${Date.now().toString().slice(-6)}`, staff_id]);

    const poId = poRes.rows[0].id;
    let totalAmount = 0;

    for (const item of items) {
      const amount = item.reorder_quantity * item.avg_cost_paise;
      totalAmount += amount;

      await db.query(`
        INSERT INTO purchase_order_items (outlet_id, purchase_order_id, ingredient_id, ordered_qty, unit_cost_paise)
        VALUES ($1, $2, $3, $4, $5)
      `, [outlet_id, poId, item.id, item.reorder_quantity, item.avg_cost_paise]);
    }

    await db.query('UPDATE purchase_orders SET total_amount_paise = $1 WHERE id = $2', [totalAmount, poId]);
    poCount++;
  }

  return { createdCount: poCount };
}
