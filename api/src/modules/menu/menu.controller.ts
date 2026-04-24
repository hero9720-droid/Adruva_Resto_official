import { Request, Response } from 'express';
import { withOutletContext, db } from '../../lib/db';
import { checkPlanLimit } from '../../lib/planLimits';
import { AppError } from '../../lib/errors';
import { logger } from '../../lib/logger';

// --- CATEGORIES ---

export async function createCategory(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { name, parent_id, icon, sort_order } = req.body;

  const result = await withOutletContext(outlet_id, async (client) => {
    const res = await client.query(
      `INSERT INTO menu_categories (outlet_id, name, parent_id, icon, sort_order)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [outlet_id, name, parent_id, icon, sort_order]
    );
    return res.rows[0];
  });

  res.status(201).json({ success: true, data: result });
}

export async function getCategories(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    const rows = await client.query(
      `SELECT c.*, COUNT(i.id)::int AS item_count
       FROM menu_categories c
       LEFT JOIN menu_items i ON i.category_id = c.id AND i.is_available = true
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.sort_order ASC`
    );
    return rows.rows;
  });

  res.json({ success: true, data: result });
}

export async function updateCategory(req: Request, res: Response) {
  const { id } = req.params;
  const outlet_id = req.user.outlet_id;
  const { name, icon, sort_order, parent_id } = req.body;

  const result = await withOutletContext(outlet_id, async (client) => {
    const rows = await client.query(
      `UPDATE menu_categories
       SET name = COALESCE($1, name),
           icon = COALESCE($2, icon),
           sort_order = COALESCE($3, sort_order),
           parent_id = $4
       WHERE id = $5
       RETURNING *`,
      [name, icon, sort_order, parent_id ?? null, id]
    );
    if (rows.rowCount === 0) throw new AppError(404, 'Category not found', 'NOT_FOUND');
    return rows.rows[0];
  });

  res.json({ success: true, data: result });
}

export async function deleteCategory(req: Request, res: Response) {
  const { id } = req.params;
  const outlet_id = req.user.outlet_id;

  await withOutletContext(outlet_id, async (client) => {
    // Soft-delete: set is_active = false so linked items keep category_id
    const rows = await client.query(
      `UPDATE menu_categories SET is_active = false WHERE id = $1 RETURNING id`,
      [id]
    );
    if (rows.rowCount === 0) throw new AppError(404, 'Category not found', 'NOT_FOUND');
    // NULL out category_id on items (keeps items, just uncategorised)
    await client.query(
      `UPDATE menu_items SET category_id = NULL WHERE category_id = $1`,
      [id]
    );
  });

  res.json({ success: true, message: 'Category deleted' });
}

export async function getMenuStats(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    // Item count
    const itemCount = await client.query(
      `SELECT COUNT(*)::int AS total FROM menu_items`
    );
    // Category count
    const catCount = await client.query(
      `SELECT COUNT(*)::int AS total FROM menu_categories WHERE is_active = true`
    );
    // Plan limit from subscriptions → plans
    const plan = await client.query(
      `SELECT p.max_menu_items
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.outlet_id = $1`,
      [outlet_id]
    );
    return {
      item_count: itemCount.rows[0]?.total ?? 0,
      category_count: catCount.rows[0]?.total ?? 0,
      max_menu_items: plan.rows[0]?.max_menu_items ?? 200,
    };
  });

  res.json({ success: true, data: result });
}

// --- MENU ITEMS ---

export async function createMenuItem(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  
  // Enforce plan limits
  await checkPlanLimit(outlet_id, 'max_menu_items');

  const { 
    category_id, name, description, photo_url, base_price_paise, 
    cost_price_paise, food_type, is_available, is_featured, 
    preparation_time_minutes, sort_order 
  } = req.body;

  const result = await withOutletContext(outlet_id, async (client) => {
    const res = await client.query(
      `INSERT INTO menu_items (
        outlet_id, category_id, name, description, photo_url, base_price_paise, 
        cost_price_paise, food_type, is_available, is_featured, 
        preparation_time_minutes, sort_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        outlet_id, category_id, name, description, photo_url, base_price_paise, 
        cost_price_paise, food_type, is_available, is_featured, 
        preparation_time_minutes, sort_order
      ]
    );
    return res.rows[0];
  });

  res.status(201).json({ success: true, data: result });
}

export async function getMenuItems(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { category_id } = req.query;

  const result = await withOutletContext(outlet_id, async (client) => {
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
    const params: any[] = [];
    
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

export async function updateMenuItem(req: Request, res: Response) {
  const { id } = req.params;
  const outlet_id = req.user.outlet_id;
  const updates = req.body;

  const result = await withOutletContext(outlet_id, async (client) => {
    // Dynamically build update query
    const fields = Object.keys(updates);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const params = Object.values(updates);
    
    const res = await client.query(
      `UPDATE menu_items SET ${setClause}, updated_at = NOW() 
       WHERE id = $${fields.length + 1} RETURNING *`,
      [...params, id]
    );

    if (res.rows.length === 0) {
      throw new AppError(404, 'Menu item not found', 'NOT_FOUND');
    }
    return res.rows[0];
  });

  res.json({ success: true, data: result });
}

export async function deleteMenuItem(req: Request, res: Response) {
  const { id } = req.params;
  const outlet_id = req.user.outlet_id;

  await withOutletContext(outlet_id, async (client) => {
    const res = await client.query(
      'DELETE FROM menu_items WHERE id = $1',
      [id]
    );
    if (res.rowCount === 0) {
      throw new AppError(404, 'Menu item not found', 'NOT_FOUND');
    }
  });

  res.json({ success: true, message: 'Menu item deleted' });
}

// --- PUBLIC MENU (No Auth — Customer QR App) ---

export async function getPublicMenu(req: Request, res: Response) {
  const { outletSlug } = req.params;

  // Find outlet by subdomain
  const outletRes = await db.query(
    `SELECT id, name, city, logo_url, phone, address
     FROM outlets 
     WHERE subdomain = $1 AND is_active = true`,
    [outletSlug]
  );

  if (outletRes.rows.length === 0) {
    throw new AppError(404, 'Outlet not found or inactive', 'NOT_FOUND');
  }

  const outlet = outletRes.rows[0];
  const outlet_id = outlet.id;

  // Get categories with their available items
  const categoriesRes = await db.query(
    `SELECT id, name, icon, sort_order
     FROM menu_categories
     WHERE outlet_id = $1 AND is_active = true
     ORDER BY sort_order ASC`,
    [outlet_id]
  );

  const itemsRes = await db.query(
    `SELECT 
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
     ORDER BY m.sort_order ASC`,
    [outlet_id]
  );

  // Group items under their categories
  const itemsByCategory: Record<string, any[]> = {};
  for (const item of itemsRes.rows) {
    const key = item.category_id ?? '__uncategorised__';
    if (!itemsByCategory[key]) itemsByCategory[key] = [];
    itemsByCategory[key].push(item);
  }

  const categories: Record<string, any>[] = categoriesRes.rows.map((cat: Record<string, any>) => ({
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
      categories: categories.filter((c: Record<string, any>) => c.items.length > 0),
    }
  });
}

