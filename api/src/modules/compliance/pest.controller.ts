import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';

export async function getPestLogs(req: Request, res: Response) {
  const { outlet_id } = req.params;
  const result = await db.query(
    'SELECT * FROM pest_control_logs WHERE outlet_id = $1 ORDER BY service_date DESC',
    [outlet_id]
  );
  res.json({ success: true, data: result.rows });
}

export async function logPestService(req: Request, res: Response) {
  const { outlet_id } = req.params;
  const { vendor_name, technician_name, service_date, next_service_due, chemicals_used, areas_treated, certificate_url, observations } = req.body;

  const result = await db.query(
    `INSERT INTO pest_control_logs (
      outlet_id, vendor_name, technician_name, service_date, next_service_due, 
      chemicals_used, areas_treated, certificate_url, observations
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
    [outlet_id, vendor_name, technician_name, service_date, next_service_due, chemicals_used, areas_treated, certificate_url, observations]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
}

export async function getPestAlerts(req: Request, res: Response) {
  const { outlet_id } = req.params;
  const result = await db.query(
    'SELECT * FROM pest_sensor_alerts WHERE outlet_id = $1 AND status != \'resolved\' ORDER BY triggered_at DESC',
    [outlet_id]
  );
  res.json({ success: true, data: result.rows });
}

export async function resolvePestAlert(req: Request, res: Response) {
  const { alert_id } = req.params;
  const { resolution_notes } = req.body;

  const result = await db.query(
    `UPDATE pest_sensor_alerts 
     SET status = 'resolved', resolved_at = NOW(), resolution_notes = $1 
     WHERE id = $2 RETURNING *`,
    [resolution_notes, alert_id]
  );

  res.json({ success: true, data: result.rows[0] });
}
