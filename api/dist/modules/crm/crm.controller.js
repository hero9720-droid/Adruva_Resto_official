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
exports.getCLVSegments = getCLVSegments;
exports.getAtRiskWhales = getAtRiskWhales;
exports.syncCLVData = syncCLVData;
exports.getInsights = getInsights;
exports.runSegmentation = runSegmentation;
exports.processAutomated = processAutomated;
const CRMService = __importStar(require("./crm.service"));
const CLVService = __importStar(require("./clv.service"));
// --- CUSTOMER LIFETIME VALUE (CLV) & PREDICTIVE ANALYTICS ---
async function getCLVSegments(req, res) {
    const result = await CLVService.getCLVSegments(req.user.chain_id);
    res.json({ success: true, data: result });
}
async function getAtRiskWhales(req, res) {
    const result = await CLVService.getAtRiskWhales(req.user.chain_id);
    res.json({ success: true, data: result });
}
async function syncCLVData(req, res) {
    await CLVService.calculateCLVMetrics(req.user.chain_id);
    res.json({ success: true, message: 'CLV data synchronized' });
}
async function getInsights(req, res) {
    const chain_id = req.user.chain_id;
    const insights = await CRMService.getCustomerInsights(chain_id);
    res.json({ success: true, data: insights });
}
async function runSegmentation(req, res) {
    const chain_id = req.user.chain_id;
    await CRMService.updateCustomerSegments(chain_id);
    res.json({ success: true, message: 'Customer segments updated based on behavioral data.' });
}
async function processAutomated(req, res) {
    const chain_id = req.user.chain_id;
    const result = await CRMService.processDailyAutomatedMarketing(chain_id);
    res.json({ success: true, data: result });
}
