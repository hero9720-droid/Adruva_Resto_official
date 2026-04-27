"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenuPricingInsights = getMenuPricingInsights;
const db_1 = require("../../lib/db");
async function getMenuPricingInsights(outlet_id) {
    // 1. Get Sales Volume & Revenue (Last 30 days)
    const salesRes = await db_1.db.query(`
    SELECT 
      mi.id as menu_item_id,
      mi.name,
      mi.price_paise,
      COUNT(oi.id) as sales_count,
      SUM(oi.unit_price_paise * oi.quantity) as total_revenue
    FROM menu_items mi
    LEFT JOIN order_items oi ON oi.menu_item_id = mi.id AND oi.created_at > NOW() - INTERVAL '30 days'
    WHERE mi.outlet_id = $1 AND mi.is_available = TRUE
    GROUP BY mi.id, mi.name, mi.price_paise
  `, [outlet_id]);
    // 2. Get Ingredient Costs per Item (via Recipes)
    const costRes = await db_1.db.query(`
    SELECT 
      r.menu_item_id,
      SUM(ri.quantity * i.avg_cost_paise) as total_ingredient_cost
    FROM recipes r
    JOIN recipe_ingredients ri ON ri.recipe_id = r.id
    JOIN ingredients i ON i.id = ri.ingredient_id
    WHERE r.outlet_id = $1
    GROUP BY r.menu_item_id
  `, [outlet_id]);
    const costsMap = new Map(costRes.rows.map(r => [r.menu_item_id, parseInt(r.total_ingredient_cost)]));
    // 3. Process Logic
    const items = salesRes.rows.map(item => {
        const cost = costsMap.get(item.menu_item_id) || 0;
        const price = item.price_paise;
        const margin = price - cost;
        const profit_margin_pct = price > 0 ? (margin / price) * 100 : 0;
        const sales_volume = parseInt(item.sales_count);
        return {
            ...item,
            cost_paise: cost,
            margin_paise: margin,
            profit_margin_pct,
            sales_volume
        };
    });
    // Calculate Averages for Quadrant Classification
    const avgSales = items.reduce((s, i) => s + i.sales_volume, 0) / (items.length || 1);
    const avgMargin = items.reduce((s, i) => s + i.profit_margin_pct, 0) / (items.length || 1);
    const insights = items.map(item => {
        let classification = 'dog';
        let suggestion = 'No change';
        let suggestedPricePaise = item.price_paise;
        if (item.sales_volume >= avgSales && item.profit_margin_pct >= avgMargin) {
            classification = 'star';
            suggestion = 'High popularity & profit. Suggest small price increase to maximize revenue.';
            suggestedPricePaise = Math.round(item.price_paise * 1.05);
        }
        else if (item.sales_volume >= avgSales && item.profit_margin_pct < avgMargin) {
            classification = 'plowhorse';
            suggestion = 'High popularity but low margin. Suggest price increase or portion reduction.';
            suggestedPricePaise = Math.round(item.price_paise * 1.15);
        }
        else if (item.sales_volume < avgSales && item.profit_margin_pct >= avgMargin) {
            classification = 'puzzle';
            suggestion = 'High profit but low sales. Suggest marketing or repositioning.';
        }
        else {
            classification = 'dog';
            suggestion = 'Low popularity & profit. Suggest removing or total rework.';
        }
        return {
            ...item,
            classification,
            suggestion,
            suggestedPricePaise
        };
    });
    return insights;
}
