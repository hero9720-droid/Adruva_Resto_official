"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDailyEPI = calculateDailyEPI;
exports.getLeaderboard = getLeaderboard;
exports.getStaffInsights = getStaffInsights;
const db_1 = require("../../lib/db");
async function calculateDailyEPI(outlet_id, date) {
    // Logic: 
    // 1. Fetch all staff who worked today
    const staffRes = await db_1.db.query(`SELECT id, role FROM staff WHERE outlet_id = $1 AND is_active = TRUE`, [outlet_id]);
    for (const staff of staffRes.rows) {
        // A. Punctuality Rating
        const attRes = await db_1.db.query(`SELECT is_late FROM attendance WHERE staff_id = $1 AND DATE(clock_in) = $2`, [staff.id, date]);
        const punctuality = attRes.rows.length > 0 && !attRes.rows[0].is_late ? 10 : 2;
        // B. Speed Rating (Kitchen/Service)
        const kdsRes = await db_1.db.query(`
      SELECT AVG(prep_time_seconds) as avg_prep 
      FROM kds_performance_logs 
      WHERE outlet_id = $1 AND DATE(created_at) = $2
    `, [outlet_id, date]);
        const speed = kdsRes.rows[0].avg_prep ? Math.max(1, 10 - (kdsRes.rows[0].avg_prep / 300)) : 5; // 5 min target
        // C. Sales Rating (Waiters)
        let sales = 5;
        if (staff.role === 'waiter') {
            const salesRes = await db_1.db.query(`
        SELECT SUM(total_paise) as total 
        FROM bills 
        WHERE outlet_id = $1 AND waiter_id = $2 AND DATE(created_at) = $3
      `, [outlet_id, staff.id, date]);
            sales = salesRes.rows[0].total ? Math.min(10, Number(salesRes.rows[0].total) / 100000) : 1; // ₹1000 = 10 rating
        }
        // D. Upsert Index
        await db_1.db.query(`
      INSERT INTO staff_performance_indices (staff_id, outlet_id, date, speed_rating, punctuality_rating, sales_rating)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (staff_id, date) DO UPDATE 
      SET speed_rating = EXCLUDED.speed_rating, punctuality_rating = EXCLUDED.punctuality_rating, sales_rating = EXCLUDED.sales_rating
    `, [staff.id, outlet_id, date, speed, punctuality, sales]);
    }
}
async function getLeaderboard(outlet_id) {
    const res = await db_1.db.query(`
    SELECT s.name, s.role, AVG(epi.overall_epi) as monthly_epi,
           COUNT(a.id) as achievement_count
    FROM staff s
    JOIN staff_performance_indices epi ON epi.staff_id = s.id
    LEFT JOIN staff_achievements a ON a.staff_id = s.id
    WHERE s.outlet_id = $1 AND epi.date >= NOW() - INTERVAL '30 days'
    GROUP BY s.id, s.name, s.role
    ORDER BY monthly_epi DESC
  `);
    return res.rows;
}
async function getStaffInsights(staff_id) {
    const epi = await db_1.db.query(`
    SELECT AVG(speed_rating) as speed, AVG(punctuality_rating) as punctuality, 
           AVG(sales_rating) as sales, AVG(customer_rating) as guest
    FROM staff_performance_indices
    WHERE staff_id = $1 AND date >= NOW() - INTERVAL '30 days'
  `, [staff_id]);
    const achievements = await db_1.db.query(`
    SELECT * FROM staff_achievements WHERE staff_id = $1 ORDER BY earned_at DESC
  `, [staff_id]);
    return {
        dimensions: epi.rows[0],
        badges: achievements.rows
    };
}
