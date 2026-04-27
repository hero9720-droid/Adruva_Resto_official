import { Request, Response } from 'express';
import * as LoyaltyService from './loyalty.service';

export async function getMyPass(req: Request, res: Response) {
  // Use customer_id from token (Customer App)
  const result = await LoyaltyService.getCustomerPass(req.user.id);
  res.json({ success: true, data: result });
}

export async function getTiers(req: Request, res: Response) {
  const result = await LoyaltyService.getChainTiers(req.user.chain_id);
  res.json({ success: true, data: result });
}

export async function forceReevaluate(req: Request, res: Response) {
  const result = await LoyaltyService.evaluateCustomerTier(req.params.id);
  res.json({ success: true, data: result });
}
