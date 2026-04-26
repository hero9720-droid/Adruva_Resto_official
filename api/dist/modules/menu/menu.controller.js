"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCategory = createCategory;
exports.getCategories = getCategories;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;
exports.getMenuStats = getMenuStats;
exports.createMenuItem = createMenuItem;
exports.getMenuItems = getMenuItems;
exports.updateMenuItem = updateMenuItem;
exports.deleteMenuItem = deleteMenuItem;
exports.getPublicMenu = getPublicMenu;
exports.syncMenuToOutlets = syncMenuToOutlets;
const db_1 = require("../../lib/db");
const planLimits_1 = require("../../lib/planLimits");
const errors_1 = require("../../lib/errors");
const logger_1 = require("../../lib/logger");
// --- CATEGORIES ---
async function createCategory(req, res) {
    const outlet_id = req.user.outlet_id;
    const { name, parent_id, icon, sort_order, tax_slab_id } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const res = await client.query(`INSERT INTO menu_categories (outlet_id, name, parent_id, icon, sort_order, tax_slab_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [outlet_id, name, parent_id, icon, sort_order, tax_slab_id ?? null]);
        return res.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function getCategories(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const rows = await client.query(`SELECT c.*, COUNT(i.id)::int AS item_count
       FROM menu_categories c
       LEFT JOIN menu_items i ON i.category_id = c.id AND i.is_available = true
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.sort_order ASC`);
        return rows.rows;
    });
    res.json({ success: true, data: result });
}
async function updateCategory(req, res) {
    const { id } = req.params;
    const outlet_id = req.user.outlet_id;
    const { name, icon, sort_order, parent_id, tax_slab_id } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const rows = await client.query(`UPDATE menu_categories
       SET name = COALESCE($1, name),
           icon = COALESCE($2, icon),
           sort_order = COALESCE($3, sort_order),
           parent_id = $4,
           tax_slab_id = COALESCE($5, tax_slab_id)
       WHERE id = $6
       RETURNING *`, [name, icon, sort_order, parent_id ?? null, tax_slab_id ?? null, id]);
        if (rows.rowCount === 0)
            throw new errors_1.AppError(404, 'Category not found', 'NOT_FOUND');
        return rows.rows[0];
    });
    res.json({ success: true, data: result });
}
async function deleteCategory(req, res) {
    const { id } = req.params;
    const outlet_id = req.user.outlet_id;
    await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // Soft-delete: set is_active = false so linked items keep category_id
        const rows = await client.query(`UPDATE menu_categories SET is_active = false WHERE id = $1 RETURNING id`, [id]);
        if (rows.rowCount === 0)
            throw new errors_1.AppError(404, 'Category not found', 'NOT_FOUND');
        // NULL out category_id on items (keeps items, just uncategorised)
        await client.query(`UPDATE menu_items SET category_id = NULL WHERE category_id = $1`, [id]);
    });
    res.json({ success: true, message: 'Category deleted' });
}
async function getMenuStats(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // Item count
        const itemCount = await client.query(`SELECT COUNT(*)::int AS total FROM menu_items`);
        // Category count
        const catCount = await client.query(`SELECT COUNT(*)::int AS total FROM menu_categories WHERE is_active = true`);
        // Plan limit from subscriptions → plans
        const plan = await client.query(`SELECT p.max_menu_items
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.outlet_id = $1`, [outlet_id]);
        return {
            item_count: itemCount.rows[0]?.total ?? 0,
            category_count: catCount.rows[0]?.total ?? 0,
            max_menu_items: plan.rows[0]?.max_menu_items ?? 200,
        };
    });
    res.json({ success: true, data: result });
}
// --- MENU ITEMS ---
async function createMenuItem(req, res) {
    const outlet_id = req.user.outlet_id;
    // Enforce plan limits
    await (0, planLimits_1.checkPlanLimit)(outlet_id, 'max_menu_items');
    const { category_id, name, description, photo_url, base_price_paise, cost_price_paise, food_type, is_available, is_featured, preparation_time_minutes, sort_order, tax_slab_id } = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const res = await client.query(`INSERT INTO menu_items (
        outlet_id, category_id, name, description, photo_url, base_price_paise, 
        cost_price_paise, food_type, is_available, is_featured, 
        preparation_time_minutes, sort_order, tax_slab_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`, [
            outlet_id, category_id, name, description, photo_url, base_price_paise,
            cost_price_paise, food_type, is_available, is_featured,
            preparation_time_minutes, sort_order, tax_slab_id ?? null
        ]);
        return res.rows[0];
    });
    res.status(201).json({ success: true, data: result });
}
async function getMenuItems(req, res) {
    const outlet_id = req.user.outlet_id;
    const { category_id } = req.query;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        let query = `
      SELECT 
        m.*,
        COALESCE(
          (SELECT json_agg(v.*) FROM menu_item_variants v WHERE v.menu_item_id = m.id), 
          '[]'::json
        ) as variants,
        COALESCE(
          (SELECT json_agg(
            json_build_object(
              'id', mg.id,
              'name', mg.name,
              'is_required', mg.is_required,
              'min_select', mg.min_select,
              'max_select', mg.max_select,
              'modifiers', COALESCE((SELECT json_agg(mod.*) FROM modifiers mod WHERE mod.group_id = mg.id), '[]'::json)
            )
          ) FROM modifier_groups mg WHERE mg.menu_item_id = m.id),
          '[]'::json
        ) as modifier_groups
      FROM menu_items m
      WHERE 1=1
    `;
        const params = [];
        if (category_id) {
            query += ' AND m.category_id = $1';
            params.push(category_id);
        }
        query += ' ORDER BY m.sort_order ASC';
        const res = await client.query(query, params);
        return res.rows;
    });
    res.json({ success: true, data: result });
}
async function updateMenuItem(req, res) {
    const { id } = req.params;
    const outlet_id = req.user.outlet_id;
    const updates = req.body;
    const result = await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        // Dynamically build update query
        const fields = Object.keys(updates);
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        const params = Object.values(updates);
        const res = await client.query(`UPDATE menu_items SET ${setClause}, updated_at = NOW() 
       WHERE id = $${fields.length + 1} RETURNING *`, [...params, id]);
        if (res.rows.length === 0) {
            throw new errors_1.AppError(404, 'Menu item not found', 'NOT_FOUND');
        }
        return res.rows[0];
    });
    res.json({ success: true, data: result });
}
async function deleteMenuItem(req, res) {
    const { id } = req.params;
    const outlet_id = req.user.outlet_id;
    await (0, db_1.withOutletContext)(outlet_id, async (client) => {
        const res = await client.query('DELETE FROM menu_items WHERE id = $1', [id]);
        if (res.rowCount === 0) {
            throw new errors_1.AppError(404, 'Menu item not found', 'NOT_FOUND');
        }
    });
    res.json({ success: true, message: 'Menu item deleted' });
}
// --- PUBLIC MENU (No Auth — Customer QR App) ---
async function getPublicMenu(req, res) {
    const { outletSlug } = req.params;
    // Find outlet by subdomain
    const outletRes = await db_1.db.query(`SELECT id, name, city, logo_url, phone, address
     FROM outlets 
     WHERE subdomain = $1 AND is_active = true`, [outletSlug]);
    if (outletRes.rows.length === 0) {
        throw new errors_1.AppError(404, 'Outlet not found or inactive', 'NOT_FOUND');
    }
    const outlet = outletRes.rows[0];
    const outlet_id = outlet.id;
    // Get categories with their available items
    const categoriesRes = await db_1.db.query(`SELECT id, name, icon, sort_order
     FROM menu_categories
     WHERE outlet_id = $1 AND is_active = true
     ORDER BY sort_order ASC`, [outlet_id]);
    const itemsRes = await db_1.db.query(`SELECT 
       m.id, m.category_id, m.name, m.description, m.photo_url,
       m.base_price_paise, m.food_type, m.is_featured,
       m.preparation_time_minutes,
       COALESCE(
         (SELECT json_agg(v.*) FROM menu_item_variants v WHERE v.menu_item_id = m.id), 
         '[]'::json
       ) as variants,
       COALESCE(
         (SELECT json_agg(
           json_build_object(
             'id', mg.id,
             'name', mg.name,
             'is_required', mg.is_required,
             'min_select', mg.min_select,
             'max_select', mg.max_select,
             'modifiers', COALESCE((SELECT json_agg(mod.*) FROM modifiers mod WHERE mod.group_id = mg.id), '[]'::json)
           )
         ) FROM modifier_groups mg WHERE mg.menu_item_id = m.id),
         '[]'::json
       ) as modifier_groups
     FROM menu_items m
     WHERE m.outlet_id = $1 AND m.is_available = true
     ORDER BY m.sort_order ASC`, [outlet_id]);
    // Group items under their categories
    const itemsByCategory = {};
    for (const item of itemsRes.rows) {
        const key = item.category_id ?? '__uncategorised__';
        if (!itemsByCategory[key])
            itemsByCategory[key] = [];
        itemsByCategory[key].push(item);
    }
    const categories = categoriesRes.rows.map((cat) => ({
        ...cat,
        items: itemsByCategory[cat.id] ?? [],
    }));
    // Include uncategorised items if any
    if (itemsByCategory['__uncategorised__']?.length) {
        categories.push({
            id: '__uncategorised__',
            name: 'Other',
            icon: '🍽️',
            sort_order: 9999,
            items: itemsByCategory['__uncategorised__'],
        });
    }
    res.json({
        success: true,
        data: {
            outlet,
            categories: categories.filter((c) => c.items.length > 0),
        }
    });
}
// --- GLOBAL CHAIN SYNC ---
async function syncMenuToOutlets(req, res) {
    const { source_outlet_id, target_outlet_ids } = req.body;
    const chain_id = req.user.chain_id;
    if (!source_outlet_id || !target_outlet_ids || target_outlet_ids.length === 0) {
        throw new errors_1.AppError(400, 'Source and targets are required', 'INVALID_INPUT');
    }
    // 1. Fetch Source Menu (Categories + Items)
    const sourceMenu = await db_1.db.query(`
    SELECT c.name as cat_name, c.icon as cat_icon, c.sort_order as cat_order,
           m.*
    FROM menu_categories c
    JOIN menu_items m ON m.category_id = c.id
    WHERE c.outlet_id = $1 AND c.is_active = true
  `, [source_outlet_id]);
    if (sourceMenu.rowCount === 0) {
        throw new errors_1.AppError(400, 'Source menu is empty', 'SOURCE_EMPTY');
    }
    // 2. Perform Sync for each target
    for (const targetId of target_outlet_ids) {
        const client = await db_1.db.connect();
        try {
            await client.query('BEGIN');
            // Map of source category name to target category ID
            const catMap = {};
            for (const row of sourceMenu.rows) {
                // A. Ensure Category exists at target
                if (!catMap[row.cat_name]) {
                    const catRes = await client.query(`INSERT INTO menu_categories (outlet_id, name, icon, sort_order)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (outlet_id, name) DO UPDATE SET icon = EXCLUDED.icon
             RETURNING id`, [targetId, row.cat_name, row.cat_icon, row.cat_order]);
                    catMap[row.cat_name] = catRes.rows[0].id;
                }
                // B. Upsert Item
                await client.query(`INSERT INTO menu_items (
            outlet_id, category_id, name, description, photo_url, base_price_paise, 
            food_type, is_available, is_featured, preparation_time_minutes, sort_order
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (outlet_id, name) DO UPDATE SET
            base_price_paise = EXCLUDED.base_price_paise,
            description = EXCLUDED.description,
            photo_url = EXCLUDED.photo_url,
            category_id = EXCLUDED.category_id,
            is_available = EXCLUDED.is_available
          `, [
                    targetId, catMap[row.cat_name], row.name, row.description, row.photo_url,
                    row.base_price_paise, row.food_type, row.is_available, row.is_featured,
                    row.preparation_time_minutes, row.sort_order
                ]);
            }
            await client.query('COMMIT');
        }
        catch (err) {
            await client.query('ROLLBACK');
            logger_1.logger.error(`Sync failed for outlet ${targetId}`, err);
        }
        finally {
            client.release();
        }
    }
    res.json({ success: true, message: `Menu synced to ${target_outlet_ids.length} outlets.` });
}
