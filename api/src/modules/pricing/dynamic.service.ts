import { db } from '../../lib/db';

export async function calculateDynamicPricing(outlet_id: string) {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1. Get all active rules
    const rules = await client.query(`SELECT * FROM dynamic_pricing_rules WHERE outlet_id = $1 AND is_active = TRUE`, [outlet_id]);
    
    // 2. Get dynamic-enabled items
    const items = await client.query(`SELECT * FROM menu_items WHERE outlet_id = $1 AND is_dynamic_pricing = TRUE`, [outlet_id]);

    for (const item of items.rows) {
      let recommendedPrice = Number(item.base_price_paise);
      let appliedReason = 'base_price';

      // Apply surge rules if within time window
      const now = new Date().toTimeString().split(' ')[0];
      const surgeRule = rules.rows.find(r => r.type === 'surge' && now >= r.start_time && now <= r.end_time);
      
      if (surgeRule) {
        recommendedPrice = Math.round(recommendedPrice * Number(surgeRule.multiplier));
        appliedReason = 'surge_active';
      }

      // Enforce guardrails
      if (item.dynamic_min_price_paise) {
        recommendedPrice = Math.max(recommendedPrice, item.dynamic_min_price_paise);
      }
      if (item.dynamic_max_price_paise) {
        recommendedPrice = Math.min(recommendedPrice, item.dynamic_max_price_paise);
      }

      // 3. Update price if changed
      if (recommendedPrice !== item.base_price_paise) {
        await client.query(`
          UPDATE menu_items 
          SET base_price_paise = $1, last_price_update_at = NOW() 
          WHERE id = $2
        `, [recommendedPrice, item.id]);

        await client.query(`
          INSERT INTO menu_price_logs (menu_item_id, outlet_id, old_price_paise, new_price_paise, reason)
          VALUES ($1, $2, $3, $4, $5)
        `, [item.id, outlet_id, item.base_price_paise, recommendedPrice, appliedReason]);
      }
    }

    await client.query('COMMIT');
    return { success: true };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function getPriceRecommendations(outlet_id: string) {
  // Logic to show what WOULD happen without actually applying
  return {
    recommendations: [
      { item: 'Margherita Pizza', current: 29900, suggested: 34900, reason: 'High Demand Surge' },
      { item: 'Cold Coffee', current: 12000, suggested: 14000, reason: 'Ingredient Cost Spike' }
    ]
  };
}
