import { Request, Response } from 'express';
import * as IntelligenceService from './intelligence.service';

export async function getCommandCenterData(req: Request, res: Response) {
  const result = await IntelligenceService.getUnifiedIntelligence(req.user.chain_id, req.query.outlet_id as string);
  res.json({ success: true, data: result });
}
