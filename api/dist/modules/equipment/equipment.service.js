"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logTelemetry = logTelemetry;
exports.getEquipmentHealth = getEquipmentHealth;
exports.scheduleMaintenance = scheduleMaintenance;
const db_1 = require("../../lib/db");
async function logTelemetry(equipment_id, metric, value) {
    // 1. Determine Status
    let status = 'normal';
    if (metric === 'temperature' && value > 7)
        status = 'warning'; // Fridge > 7C
    if (metric === 'temperature' && value > 12)
        status = 'critical';
    // 2. Log Telemetry
    await db_1.db.query(`
    INSERT INTO equipment_telemetry_logs (equipment_id, metric_name, metric_value, status)
    VALUES ($1, $2, $3, $4)
  `, [equipment_id, metric, value, status]);
    // 3. Update Equipment Status if Critical
    if (status !== 'normal') {
        await db_1.db.query(`
      UPDATE equipment_registry 
      SET status = CASE WHEN $2 = 'critical' THEN 'down' ELSE 'warning' END, 
          updated_at = NOW()
      WHERE id = $1
    `, [equipment_id, status]);
    }
}
async function getEquipmentHealth(outlet_id) {
    const res = await db_1.db.query(`
    SELECT e.*, 
      (SELECT json_agg(t.*) FROM (
        SELECT metric_name, metric_value, status, logged_at 
        FROM equipment_telemetry_logs 
        WHERE equipment_id = e.id 
        ORDER BY logged_at DESC LIMIT 5
      ) t) as recent_telemetry
    FROM equipment_registry e
    WHERE e.outlet_id = $1
    ORDER BY e.status DESC
  `, [outlet_id]);
    return res.rows;
}
async function scheduleMaintenance(equipment_id, description, scheduled_at) {
    return await db_1.db.query(`
    INSERT INTO maintenance_tickets (equipment_id, outlet_id, issue_description, scheduled_at)
    SELECT $1, outlet_id, $2, $3 FROM equipment_registry WHERE id = $1
    RETURNING *
  `, [equipment_id, description, scheduled_at]);
}
