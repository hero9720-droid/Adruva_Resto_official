import { Request, Response } from 'express';
import * as MenuAI from './menu.ai';
import { db } from '../../lib/db';

export async function getPricingInsights(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const insights = await MenuAI.getMenuPricingInsights(outlet_id);
  res.json({ success: true, data: insights });
}

export async function applyPricing(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { recommendations } = req.body; // Array of { menu_item_id, suggestedPricePaise }

  for (const rec of recommendations) {
    await db.query(
      'UPDATE menu_items SET price_paise = $1, updated_at = NOW() WHERE id = $2 AND outlet_id = $3',
      [rec.suggestedPricePaise, rec.menu_item_id, outlet_id]
    );
  }

  res.json({ success: true, message: `Applied ${recommendations.length} price changes.` });
}

export async function getMenuStyles(req: Request, res: Response) {
  // Placeholder for AI style engine
  res.json({ success: true, data: { primary: '#primary', secondary: '#secondary', font: 'Inter' } });
}

export async function generateMenuItemDescription(req: Request, res: Response) {
  const { name } = req.body;
  res.json({ success: true, data: { description: `A delicious ${name} prepared with fresh ingredients.` } });
}
