import { Request, Response } from 'express';
import { withOutletContext, db } from '../../lib/db';
import { AppError } from '../../lib/errors';

// --- INGREDIENTS ---

export async function createIngredient(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  // DB schema: category(text), unit, current_stock, low_threshold, avg_cost_paise
  const { name, category, unit, current_stock = 0, low_threshold = 0, avg_cost_paise = 0 } = req.body;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `INSERT INTO ingredients (outlet_id, name, category, unit, current_stock, low_threshold, avg_cost_paise)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [outlet_id, name, category, unit, current_stock, low_threshold, avg_cost_paise]
    );
    return r.rows[0];
  });

  res.status(201).json({ success: true, data: result });
}

export async function getIngredients(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `SELECT * FROM ingredients 
       WHERE outlet_id = $1 AND is_active = true 
       ORDER BY category ASC, name ASC`,
      [outlet_id]
    );
    return r.rows;
  });

  res.json({ success: true, data: result });
}

export async function getLowStockIngredients(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `SELECT * FROM ingredients 
       WHERE outlet_id = $1 AND is_active = true AND current_stock <= low_threshold
       ORDER BY current_stock ASC`,
      [outlet_id]
    );
    return r.rows;
  });

  res.json({ success: true, data: result });
}

// --- STOCK MOVEMENTS ---

export async function recordMovement(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const staff_id = req.user.staff_id;
  const { 
    ingredient_id, type, quantity, unit_cost_paise = 0,
    supplier_id, delivery_rating, delivery_status, delivery_notes
  } = req.body;

  const result = await withOutletContext(outlet_id, async (client) => {
    const total_cost_paise = unit_cost_paise * quantity;

    const moveRes = await client.query(
      `INSERT INTO stock_movements (
        outlet_id, ingredient_id, type, quantity, unit_cost_paise, total_cost_paise, 
        created_by, supplier_id, delivery_rating, delivery_status, delivery_notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        outlet_id, ingredient_id, type, quantity, unit_cost_paise, total_cost_paise, 
        staff_id, supplier_id || null, delivery_rating || null, delivery_status || null, delivery_notes || null
      ]
    );

    // Update stock
    const delta = (type === 'purchase' || type === 'return') ? quantity : -quantity;
    await client.query(
      'UPDATE ingredients SET current_stock = current_stock + $1, last_restocked_at = CASE WHEN $2 > 0 THEN NOW() ELSE last_restocked_at END WHERE id = $3',
      [delta, delta, ingredient_id]
    );

    // If purchase with rating, update supplier score
    if (type === 'purchase' && supplier_id && delivery_rating) {
      await client.query(
        `UPDATE suppliers 
         SET performance_score = (performance_score * total_deliveries + $1) / (total_deliveries + 1),
             total_deliveries = total_deliveries + 1,
             updated_at = NOW()
         WHERE id = $2`,
        [delivery_rating, supplier_id]
      );
    }

    return moveRes.rows[0];
  });

  res.status(201).json({ success: true, data: result });
}

export async function getSupplierPerformance(req: Request, res: Response) {
  const chain_id = req.user.chain_id;

  const result = await db.query(
    `SELECT s.*,
       (SELECT COUNT(*) FROM stock_movements WHERE supplier_id = s.id AND delivery_status = 'late') as late_count,
       (SELECT AVG(delivery_rating) FROM stock_movements WHERE supplier_id = s.id) as avg_rating
     FROM suppliers s
     WHERE s.outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)
     ORDER BY s.performance_score DESC`,
    [chain_id]
  );

  res.json({ success: true, data: result.rows });
}

export async function getMovements(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { ingredient_id } = req.query;

  const result = await withOutletContext(outlet_id, async (client) => {
    const params: any[] = [outlet_id];
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

export async function createSupplier(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { name, contact_person, email, phone, address, gstin } = req.body;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `INSERT INTO suppliers (outlet_id, name, contact_person, email, phone, address, gstin)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [outlet_id, name, contact_person, email, phone, address, gstin]
    );
    return r.rows[0];
  });

  res.status(201).json({ success: true, data: result });
}

export async function getSuppliers(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      'SELECT * FROM suppliers WHERE outlet_id = $1 ORDER BY name ASC',
      [outlet_id]
    );
    return r.rows;
  });

  res.json({ success: true, data: result });
}

export async function updateSupplier(req: Request, res: Response) {
  const { id } = req.params;
  const outlet_id = req.user.outlet_id;
  const updates = req.body;

  const result = await withOutletContext(outlet_id, async (client) => {
    const fields = Object.keys(updates);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const params = Object.values(updates);
    
    const r = await client.query(
      `UPDATE suppliers SET ${setClause}, updated_at = NOW() 
       WHERE id = $${fields.length + 1} AND outlet_id = $${fields.length + 2} RETURNING *`,
      [...params, id, outlet_id]
    );

    if (r.rows.length === 0) throw new AppError(404, 'Supplier not found', 'NOT_FOUND');
    return r.rows[0];
  });

  res.json({ success: true, data: result });
}

export async function deleteSupplier(req: Request, res: Response) {
  const { id } = req.params;
  const outlet_id = req.user.outlet_id;

  await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      'DELETE FROM suppliers WHERE id = $1 AND outlet_id = $2',
      [id, outlet_id]
    );
    if (r.rowCount === 0) throw new AppError(404, 'Supplier not found', 'NOT_FOUND');
  });

  res.json({ success: true, message: 'Supplier deleted' });
}

// --- STOCK TRANSFERS ---

export async function initiateTransfer(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const staff_id = req.user.staff_id;
  const { from_outlet_id, to_outlet_id, ingredient_id, quantity, notes } = req.body;

  if (from_outlet_id === to_outlet_id) {
    throw new AppError(400, 'Source and destination outlets must be different', 'INVALID_TRANSFER');
  }

  const result = await db.query(
    `INSERT INTO stock_transfers (chain_id, from_outlet_id, to_outlet_id, ingredient_id, quantity, notes, created_by, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending') RETURNING *`,
    [chain_id, from_outlet_id, to_outlet_id, ingredient_id, quantity, notes, staff_id]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
}

export async function getTransfers(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id; // For outlet-app views
  const chain_id = req.user.chain_id; // For chain-app views
  
  const query = `
    SELECT st.*, i.name as ingredient_name, 
           fo.name as from_outlet_name, to_o.name as to_outlet_name,
           s.name as creator_name
    FROM stock_transfers st
    JOIN ingredients i ON i.id = st.ingredient_id
    JOIN outlets fo ON fo.id = st.from_outlet_id
    JOIN outlets to_o ON to_o.id = st.to_outlet_id
    LEFT JOIN staff s ON s.id = st.created_by
    WHERE st.chain_id = $1
    ${outlet_id ? 'AND (st.from_outlet_id = $2 OR st.to_outlet_id = $2)' : ''}
    ORDER BY st.created_at DESC
  `;
  const params = outlet_id ? [chain_id, outlet_id] : [chain_id];
  const result = await db.query(query, params);
  
  res.json({ success: true, data: result.rows });
}

export async function completeTransfer(req: Request, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // 'shipped', 'received', 'cancelled'
  const staff_id = req.user.staff_id;

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Get transfer details
    const stRes = await client.query('SELECT * FROM stock_transfers WHERE id = $1 FOR UPDATE', [id]);
    if (stRes.rowCount === 0) throw new AppError(404, 'Transfer not found', 'NOT_FOUND');
    const transfer = stRes.rows[0];

    if (transfer.status === 'received' || transfer.status === 'cancelled') {
      throw new AppError(400, 'Transfer is already finalized', 'ALREADY_FINAL');
    }

    // 2. If status is 'received', perform the stock swap
    if (status === 'received') {
      // Deduct from source
      const deductRes = await client.query(
        'UPDATE ingredients SET current_stock = current_stock - $1 WHERE id = $2 AND outlet_id = $3 RETURNING id',
        [transfer.quantity, transfer.ingredient_id, transfer.from_outlet_id]
      );
      if (deductRes.rowCount === 0) throw new AppError(400, 'Source ingredient not found', 'SOURCE_NOT_FOUND');

      // Add to destination
      // Note: We assume the ingredient exists at destination with the same ID for multi-outlet syncing, 
      // or we match by name if IDs differ. In Adruva, we'll match by name if ID fails.
      const addRes = await client.query(
        'UPDATE ingredients SET current_stock = current_stock + $1 WHERE id = $2 AND outlet_id = $3 RETURNING id',
        [transfer.quantity, transfer.ingredient_id, transfer.to_outlet_id]
      );

      // Fallback: match by name if IDs are outlet-specific
      if (addRes.rowCount === 0) {
        const sourceIng = await client.query('SELECT name FROM ingredients WHERE id = $1', [transfer.ingredient_id]);
        await client.query(
          'UPDATE ingredients SET current_stock = current_stock + $1 WHERE name = $2 AND outlet_id = $3',
          [transfer.quantity, sourceIng.rows[0].name, transfer.to_outlet_id]
        );
      }
    }

    // 3. Update status
    const updated = await client.query(
      'UPDATE stock_transfers SET status = $1, received_by = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [status, staff_id, id]
    );

    await client.query('COMMIT');
    res.json({ success: true, data: updated.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function deductStockFromRecipe(client: any, outlet_id: string, menu_item_id: string, quantity: number = 1) {
  // 1. Get ingredients for the recipe
  const recipeItems = await client.query(`
    SELECT ri.ingredient_id, ri.quantity as req_qty, i.name as ingredient_name
    FROM recipe_ingredients ri
    JOIN recipes r ON r.id = ri.recipe_id
    JOIN ingredients i ON i.id = ri.ingredient_id
    WHERE r.menu_item_id = $1 AND r.outlet_id = $2
  `, [menu_item_id, outlet_id]);

  for (const item of recipeItems.rows) {
    const totalDeduct = item.req_qty * quantity;

    // 2. Deduct from ingredients
    await client.query(
      `UPDATE ingredients 
       SET current_stock = current_stock - $1, 
           updated_at = NOW() 
       WHERE id = $2 AND outlet_id = $3`,
      [totalDeduct, item.ingredient_id, outlet_id]
    );

    // 3. Record movement
    await client.query(
      `INSERT INTO stock_movements (outlet_id, ingredient_id, type, quantity, notes)
       VALUES ($1, $2, 'kitchen_use', $3, $4)`,
      [outlet_id, item.ingredient_id, totalDeduct, `Auto-deduct for menu_item ${menu_item_id}`]
    );
  }
}
