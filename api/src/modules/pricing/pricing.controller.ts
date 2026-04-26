import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';

export async function createPricingRule(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const { name, rule_type, target_category_id, target_item_id, adjustment_percent, start_time, end_time } = req.body;

  const result = await db.query(
    `INSERT INTO pricing_rules (chain_id, name, rule_type, target_category_id, target_item_id, adjustment_percent, start_time, end_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [chain_id, name, rule_type, target_category_id || null, target_item_id || null, adjustment_percent, start_time, end_time]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
}

export async function getPricingRules(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const result = await db.query(
    'SELECT * FROM pricing_rules WHERE chain_id = $1 ORDER BY created_at DESC',
    [chain_id]
  );
  res.json({ success: true, data: result.rows });
}

export async function recalculateDynamicPrices(req: Request, res: Response) {
  const chain_id = req.user.chain_id;

  // 1. Fetch all active rules
  const rules = await db.query(
    'SELECT * FROM pricing_rules WHERE chain_id = $1 AND is_active = true',
    [chain_id]
  );

  // 2. Fetch all menu items for the chain
  const items = await db.query(
    'SELECT * FROM menu_items WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)',
    [chain_id]
  );

  const now = new Date();
  const currentTime = now.getHours() + ':' + now.getMinutes() + ':00';

  let updatedCount = 0;

  for (const item of items.rows) {
    let finalAdjustment = 0;

    // Apply rules
    for (const rule of rules.rows) {
      let applies = false;
      
      // Match Target
      if (rule.target_item_id === item.id) applies = true;
      else if (rule.target_category_id === item.category_id) applies = true;
      else if (!rule.target_item_id && !rule.target_category_id) applies = true; // Global

      // Match Time
      if (applies && rule.rule_type === 'time_based') {
        if (currentTime < rule.start_time || currentTime > rule.end_time) {
          applies = false;
        }
      }

      if (applies) {
        finalAdjustment += rule.adjustment_percent;
      }
    }

    const dynamicPrice = Math.round(item.base_price_paise * (1 + finalAdjustment / 100));
    
    await db.query(
      'UPDATE menu_items SET dynamic_price_paise = $1 WHERE id = $2',
      [dynamicPrice, item.id]
    );
    updatedCount++;
  }

  res.json({ success: true, message: `Recalculated prices for ${updatedCount} items.` });
}
