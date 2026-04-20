import { PoolClient } from 'pg';
import { logger } from './logger';

/**
 * Deducts inventory based on a menu item's recipe.
 * Called when an order is confirmed.
 */
export async function deductInventory(client: PoolClient, outlet_id: string, menu_item_id: string, quantity: number, staff_id: string) {
  // 1. Get recipe ingredients
  const recipeRes = await client.query(
    `SELECT ri.ingredient_id, ri.quantity as recipe_qty
     FROM recipes r
     JOIN recipe_ingredients ri ON ri.recipe_id = r.id
     WHERE r.menu_item_id = $1 AND r.outlet_id = $2`,
    [menu_item_id, outlet_id]
  );

  for (const row of recipeRes.rows) {
    const totalDeduction = row.recipe_qty * quantity;

    // 2. Decrement stock in ingredients table
    await client.query(
      `UPDATE ingredients 
       SET current_stock = current_stock - $1 
       WHERE id = $2 AND outlet_id = $3`,
      [totalDeduction, row.ingredient_id, outlet_id]
    );

    // 3. Create stock movement record
    await client.query(
      `INSERT INTO stock_movements (
        outlet_id, ingredient_id, type, quantity, reason, reference_id, created_by
      ) VALUES ($1, $2, 'kitchen_use', $3, 'Order deduction', $4, $5)`,
      [outlet_id, row.ingredient_id, totalDeduction, menu_item_id, staff_id]
    );
  }
}
