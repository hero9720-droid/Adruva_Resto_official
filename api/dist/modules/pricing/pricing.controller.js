"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDynamicRecommendations = getDynamicRecommendations;
exports.syncDynamicPrices = syncDynamicPrices;
exports.createPricingRule = createPricingRule;
exports.getPricingRules = getPricingRules;
exports.recalculateDynamicPrices = recalculateDynamicPrices;
exports.getPricingHistory = getPricingHistory;
const db_1 = require("../../lib/db");
const DynamicService = __importStar(require("./dynamic.service"));
// --- AI-DRIVEN DYNAMIC PRICING ---
async function getDynamicRecommendations(req, res) {
    const result = await DynamicService.getPriceRecommendations(req.user.outlet_id);
    res.json({ success: true, data: result });
}
async function syncDynamicPrices(req, res) {
    await DynamicService.calculateDynamicPricing(req.user.outlet_id);
    res.json({ success: true, message: 'Dynamic prices synchronized' });
}
async function createPricingRule(req, res) {
    const chain_id = req.user.chain_id;
    const { name, rule_type, target_category_id, target_item_id, adjustment_percent, start_time, end_time } = req.body;
    const result = await db_1.db.query(`INSERT INTO pricing_rules (chain_id, name, rule_type, target_category_id, target_item_id, adjustment_percent, start_time, end_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [chain_id, name, rule_type, target_category_id || null, target_item_id || null, adjustment_percent, start_time, end_time]);
    res.status(201).json({ success: true, data: result.rows[0] });
}
async function getPricingRules(req, res) {
    const chain_id = req.user.chain_id;
    const result = await db_1.db.query('SELECT * FROM pricing_rules WHERE chain_id = $1 ORDER BY created_at DESC', [chain_id]);
    res.json({ success: true, data: result.rows });
}
async function recalculateDynamicPrices(req, res) {
    const chain_id = req.user.chain_id;
    // 1. Fetch all active rules
    const rules = await db_1.db.query('SELECT * FROM pricing_rules WHERE chain_id = $1 AND is_active = true', [chain_id]);
    // 2. Fetch all menu items for the chain
    const items = await db_1.db.query('SELECT * FROM menu_items WHERE outlet_id IN (SELECT id FROM outlets WHERE chain_id = $1)', [chain_id]);
    const now = new Date();
    const currentTime = now.getHours() + ':' + now.getMinutes() + ':00';
    let updatedCount = 0;
    for (const item of items.rows) {
        let finalAdjustment = 0;
        // Apply rules
        for (const rule of rules.rows) {
            let applies = false;
            // Match Target
            if (rule.target_item_id === item.id)
                applies = true;
            else if (rule.target_category_id === item.category_id)
                applies = true;
            else if (!rule.target_item_id && !rule.target_category_id)
                applies = true; // Global
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
        await db_1.db.query('UPDATE menu_items SET dynamic_price_paise = $1 WHERE id = $2', [dynamicPrice, item.id]);
        updatedCount++;
    }
    res.json({ success: true, message: `Recalculated prices for ${updatedCount} items.` });
}
async function getPricingHistory(req, res) {
    const chain_id = req.user.chain_id;
    const result = await db_1.db.query('SELECT * FROM pricing_rules WHERE chain_id = $1 ORDER BY created_at DESC', [chain_id]);
    res.json({ success: true, data: result.rows });
}
