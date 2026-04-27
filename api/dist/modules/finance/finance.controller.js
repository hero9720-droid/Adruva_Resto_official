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
exports.getLivePnL = getLivePnL;
exports.getFinancialProjections = getFinancialProjections;
exports.createTaxSlab = createTaxSlab;
exports.getTaxSlabs = getTaxSlabs;
exports.getTaxSummary = getTaxSummary;
exports.updateComplianceInfo = updateComplianceInfo;
const db_1 = require("../../lib/db");
const TaxService = __importStar(require("./tax.service"));
const PnLService = __importStar(require("./pnl.service"));
// --- P&L & ANALYTICS ---
async function getLivePnL(req, res) {
    const result = await PnLService.getLivePnL(req.user.outlet_id, Number(req.query.month_offset || 0));
    res.json({ success: true, data: result });
}
async function getFinancialProjections(req, res) {
    const result = await PnLService.getFinancialProjections(req.user.outlet_id);
    res.json({ success: true, data: result });
}
// --- TAX SLAB MANAGEMENT ---
async function createTaxSlab(req, res) {
    const { name, percentage, tax_code, is_inclusive } = req.body;
    const outlet_id = req.user.outlet_id;
    const result = await db_1.db.query(`INSERT INTO tax_slabs (outlet_id, name, percentage, tax_code, is_inclusive)
     VALUES ($1, $2, $3, $4, $5) 
     ON CONFLICT (outlet_id, tax_code) DO UPDATE 
     SET percentage = EXCLUDED.percentage, name = EXCLUDED.name, is_inclusive = EXCLUDED.is_inclusive
     RETURNING *`, [outlet_id, name, percentage, tax_code, is_inclusive]);
    res.status(201).json({ success: true, data: result.rows[0] });
}
async function getTaxSlabs(req, res) {
    const outlet_id = req.user.outlet_id;
    const result = await db_1.db.query('SELECT * FROM tax_slabs WHERE outlet_id = $1 AND is_active = TRUE ORDER BY percentage ASC', [outlet_id]);
    res.json({ success: true, data: result.rows });
}
// --- COMPLIANCE REPORTING ---
async function getTaxSummary(req, res) {
    const { start_date, end_date } = req.query;
    const outlet_id = req.user.outlet_id;
    const result = await TaxService.getTaxSummaryReport(outlet_id, new Date(start_date || '1970-01-01'), new Date(end_date || '2099-12-31'));
    res.json({ success: true, data: result });
}
async function updateComplianceInfo(req, res) {
    const { gstin, fssai_license, vat_number, tax_config } = req.body;
    const outlet_id = req.user.outlet_id;
    await db_1.db.query(`
    UPDATE outlets 
    SET gstin = $1, fssai_license = $2, vat_number = $3, tax_config = $4
    WHERE id = $5
  `, [gstin, fssai_license, vat_number, JSON.stringify(tax_config), outlet_id]);
    res.json({ success: true, message: 'Compliance information updated.' });
}
