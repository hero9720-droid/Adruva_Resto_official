import { Request, Response } from 'express';
import * as EquipmentService from './equipment.service';

export async function getHealthStatus(req: Request, res: Response) {
  const result = await EquipmentService.getEquipmentHealth(req.user.outlet_id);
  res.json({ success: true, data: result });
}

export async function logTelemetry(req: Request, res: Response) {
  const { equipment_id, metric, value } = req.body;
  await EquipmentService.logTelemetry(equipment_id, metric, value);
  res.json({ success: true, message: 'Telemetry logged' });
}

export async function createTicket(req: Request, res: Response) {
  const { equipment_id, description, scheduled_at } = req.body;
  const result = await EquipmentService.scheduleMaintenance(equipment_id, description, scheduled_at);
  res.json({ success: true, data: result.rows[0] });
}
