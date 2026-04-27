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
exports.getPricingInsights = getPricingInsights;
exports.applyPricing = applyPricing;
exports.getMenuStyles = getMenuStyles;
exports.generateMenuItemDescription = generateMenuItemDescription;
const MenuAI = __importStar(require("./menu.ai"));
const db_1 = require("../../lib/db");
async function getPricingInsights(req, res) {
    const outlet_id = req.user.outlet_id;
    const insights = await MenuAI.getMenuPricingInsights(outlet_id);
    res.json({ success: true, data: insights });
}
async function applyPricing(req, res) {
    const outlet_id = req.user.outlet_id;
    const { recommendations } = req.body; // Array of { menu_item_id, suggestedPricePaise }
    for (const rec of recommendations) {
        await db_1.db.query('UPDATE menu_items SET price_paise = $1, updated_at = NOW() WHERE id = $2 AND outlet_id = $3', [rec.suggestedPricePaise, rec.menu_item_id, outlet_id]);
    }
    res.json({ success: true, message: `Applied ${recommendations.length} price changes.` });
}
async function getMenuStyles(req, res) {
    // Placeholder for AI style engine
    res.json({ success: true, data: { primary: '#primary', secondary: '#secondary', font: 'Inter' } });
}
async function generateMenuItemDescription(req, res) {
    const { name } = req.body;
    res.json({ success: true, data: { description: `A delicious ${name} prepared with fresh ingredients.` } });
}
