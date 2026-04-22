"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPlanLimit = checkPlanLimit;
const db_1 = require("./db");
const errors_1 = require("./errors");
/**
 * Checks if an outlet has reached its plan limit for a specific resource.
 * Resource types: 'tables', 'staff', 'menu_items'
 */
async function checkPlanLimit(outlet_id, resource) {
    const result = await db_1.db.query(`SELECT p.${resource}, 
      CASE 
        WHEN '${resource}' = 'max_tables' THEN (SELECT COUNT(*) FROM tables WHERE outlet_id = $1 AND is_active = true)
        WHEN '${resource}' = 'max_staff' THEN (SELECT COUNT(*) FROM staff WHERE outlet_id = $1 AND is_active = true)
        WHEN '${resource}' = 'max_menu_items' THEN (SELECT COUNT(*) FROM menu_items WHERE outlet_id = $1)
        WHEN '${resource}' = 'max_orders_per_month' THEN (
          SELECT COUNT(*) FROM orders 
          WHERE outlet_id = $1 AND date_trunc('month', created_at) = date_trunc('month', CURRENT_DATE)
        )
      END as current_count
     FROM outlets o
     JOIN plans p ON p.id = o.plan_id
     WHERE o.id = $1`, [outlet_id]);
    const { [resource]: limit, current_count } = result.rows[0] || {};
    if (limit !== null && parseInt(current_count) >= limit) {
        throw new errors_1.AppError(422, `Plan limit exceeded for ${resource.replace('max_', '')}. Limit: ${limit}`, 'PLAN_LIMIT_EXCEEDED', {
            resource: resource.replace('max_', ''),
            limit,
            current: parseInt(current_count)
        });
    }
}
