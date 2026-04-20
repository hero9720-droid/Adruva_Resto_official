import { Request, Response } from 'express';
import { withChainContext } from '../../../lib/db';
import { AppError } from '../../../lib/errors';

export async function getMasterCategories(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  
  const result = await withChainContext(chain_id, async (client) => {
    return await client.query(
      'SELECT * FROM menu_categories WHERE chain_id = $1 AND outlet_id IS NULL AND is_active = true ORDER BY sort_order ASC',
      [chain_id]
    );
  });
  res.json({ success: true, data: result.rows });
}

export async function createMasterCategory(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const { name, icon, sort_order } = req.body;
  
  const result = await withChainContext(chain_id, async (client) => {
    return await client.query(
      `INSERT INTO menu_categories (chain_id, name, icon, sort_order, outlet_id) 
       VALUES ($1, $2, $3, $4, NULL) RETURNING *`,
      [chain_id, name, icon, sort_order]
    );
  });
  res.status(201).json({ success: true, data: result.rows[0] });
}

export async function getMasterMenuItems(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const { category_id } = req.query;
  
  const result = await withChainContext(chain_id, async (client) => {
    let query = 'SELECT * FROM menu_items WHERE chain_id = $1 AND outlet_id IS NULL';
    const params: any[] = [chain_id];
    
    if (category_id) {
      query += ' AND category_id = $2';
      params.push(category_id);
    }
    
    return await client.query(query, params);
  });
  
  res.json({ success: true, data: result.rows });
}

export async function createMasterMenuItem(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const { 
    category_id, name, description, photo_url, base_price_paise, 
    food_type, is_available 
  } = req.body;

  const result = await withChainContext(chain_id, async (client) => {
    return await client.query(
      `INSERT INTO menu_items (
        chain_id, category_id, name, description, photo_url, base_price_paise, 
        food_type, is_available, outlet_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NULL) RETURNING *`,
      [
        chain_id, category_id, name, description, photo_url, 
        base_price_paise, food_type, is_available
      ]
    );
  });

  res.status(201).json({ success: true, data: result.rows[0] });
}
