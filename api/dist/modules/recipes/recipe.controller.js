"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRecipe = createRecipe;
exports.getRecipe = getRecipe;
const db_1 = require("../../lib/db");
async function createRecipe(req, res) {
    const outlet_id = req.user.outlet_id;
    const { menu_item_id, ingredients } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // 1. Create recipe header
        const recipeRes = await client.query(`INSERT INTO recipes (outlet_id, menu_item_id) VALUES ($1, $2) 
       ON CONFLICT (menu_item_id) DO UPDATE SET updated_at = NOW()
       RETURNING id`, [outlet_id, menu_item_id]);
        const recipe_id = recipeRes.rows[0].id;
        // 2. Clear old ingredients
        await client.query('DELETE FROM recipe_ingredients WHERE recipe_id = $1', [recipe_id]);
        // 3. Add new ingredients
        for (const ing of ingredients) {
            await client.query(`INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
         VALUES ($1, $2, $3)`, [recipe_id, ing.ingredient_id, ing.quantity]);
        }
        return { recipe_id, menu_item_id, ingredients_count: ingredients.length };
    });
    res.status(201).json({ success: true, data: result });
}
async function getRecipe(req, res) {
    const { menuItemId } = req.params;
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const r = await client.query(`SELECT ri.*, i.name as ingredient_name, i.unit
       FROM recipe_ingredients ri
       JOIN recipes r ON r.id = ri.recipe_id
       JOIN ingredients i ON i.id = ri.ingredient_id
       WHERE r.menu_item_id = $1 AND r.outlet_id = $2`, [menuItemId, outlet_id]);
        return r.rows;
    });
    res.json({ success: true, data: result });
}
