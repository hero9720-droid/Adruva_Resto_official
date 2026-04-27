"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = getLeaderboard;
exports.awardPoints = awardPoints;
exports.getStaffPerformanceStats = getStaffPerformanceStats;
const db_1 = require("../../lib/db");
async function getLeaderboard(outlet_id) {
    const res = await db_1.db.query(`
    SELECT 
      s.id, 
      s.name, 
      s.role,
      s.gamification_points,
      s.current_rank,
      COUNT(o.id) as orders_handled,
      SUM(oi.total_paise) as total_sales_paise
    FROM staff s
    LEFT JOIN orders o ON o.waiter_id = s.id AND o.created_at > NOW() - INTERVAL '30 days'
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE s.outlet_id = $1 AND s.is_active = TRUE
    GROUP BY s.id
    ORDER BY s.gamification_points DESC
  `, [outlet_id]);
    return res.rows;
}
async function awardPoints(staff_id, outlet_id, type, points, metadata = {}) {
    await db_1.db.query(`
    INSERT INTO staff_performance_logs (outlet_id, staff_id, metric_type, points_awarded, metadata)
    VALUES ($1, $2, $3, $4, $5)
  `, [outlet_id, staff_id, type, points, JSON.stringify(metadata)]);
    await db_1.db.query(`
    UPDATE staff 
    SET gamification_points = gamification_points + $1,
        current_rank = CASE 
          WHEN gamification_points + $1 > 5000 THEN 'Legend'
          WHEN gamification_points + $1 > 2000 THEN 'Master'
          WHEN gamification_points + $1 > 1000 THEN 'Expert'
          WHEN gamification_points + $1 > 500 THEN 'Senior'
          ELSE 'Rookie'
        END
    WHERE id = $2
  `, [points, staff_id]);
}
async function getStaffPerformanceStats(staff_id) {
    const stats = await db_1.db.query(`
    SELECT 
      metric_type, 
      SUM(points_awarded) as total_points,
      COUNT(*) as frequency
    FROM staff_performance_logs
    WHERE staff_id = $1
    GROUP BY metric_type
  `, [staff_id]);
    return stats.rows;
}
