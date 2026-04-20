"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("./lib/db");
const redis_1 = require("./lib/redis");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const chainAuth_routes_1 = __importDefault(require("./modules/chain/auth/chainAuth.routes"));
const superadminAuth_routes_1 = __importDefault(require("./modules/superadmin/auth/superadminAuth.routes"));
const menu_routes_1 = __importDefault(require("./modules/menu/menu.routes"));
const orders_routes_1 = __importDefault(require("./modules/orders/orders.routes"));
const billing_routes_1 = __importDefault(require("./modules/billing/billing.routes"));
const staff_routes_1 = __importDefault(require("./modules/staff/staff.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const inventory_routes_1 = __importDefault(require("./modules/inventory/inventory.routes"));
const expense_routes_1 = __importDefault(require("./modules/expenses/expense.routes"));
const customer_routes_1 = __importDefault(require("./modules/customers/customer.routes"));
const reservation_routes_1 = __importDefault(require("./modules/reservations/reservation.routes"));
const settings_routes_1 = __importDefault(require("./modules/settings/settings.routes"));
const superadmin_routes_1 = __importDefault(require("./modules/superadmin/management/superadmin.routes"));
const chain_routes_1 = __importDefault(require("./modules/chain/management/chain.routes"));
const recipe_routes_1 = __importDefault(require("./modules/recipes/recipe.routes"));
const router = (0, express_1.Router)();
/**
 * @route GET /api/health
 * @desc  System health check
 */
router.get('/health', async (req, res) => {
    let dbStatus = 'connected';
    let redisStatus = 'connected';
    try {
        await db_1.db.query('SELECT 1');
    }
    catch (err) {
        dbStatus = 'disconnected';
    }
    try {
        await redis_1.redis.ping();
    }
    catch (err) {
        redisStatus = 'disconnected';
    }
    res.json({
        success: true,
        status: dbStatus === 'connected' && redisStatus === 'connected' ? 'ok' : 'degraded',
        db: dbStatus,
        redis: redisStatus,
        timestamp: new Date().toISOString()
    });
});
// Auth Routes
router.use('/auth', auth_routes_1.default);
router.use('/chain/auth', chainAuth_routes_1.default);
router.use('/superadmin/auth', superadminAuth_routes_1.default);
// Business Routes
router.use('/menu', menu_routes_1.default);
router.use('/orders', orders_routes_1.default);
router.use('/billing', billing_routes_1.default);
router.use('/staff', staff_routes_1.default);
router.use('/analytics', analytics_routes_1.default);
router.use('/inventory', inventory_routes_1.default);
router.use('/expenses', expense_routes_1.default);
router.use('/customers', customer_routes_1.default);
router.use('/reservations', reservation_routes_1.default);
router.use('/settings', settings_routes_1.default);
// Multi-Tenant Management
router.use('/superadmin/mgmt', superadmin_routes_1.default);
router.use('/chain/mgmt', chain_routes_1.default);
router.use('/recipes', recipe_routes_1.default);
exports.default = router;
