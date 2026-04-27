import { Request, Response } from 'express';
import * as WaitlistService from './waitlist.service';

export async function getActiveWaitlist(req: Request, res: Response) {
  const result = await WaitlistService.getActiveWaitlist(req.user.outlet_id);
  res.json({ success: true, data: result });
}

export async function joinWaitlist(req: Request, res: Response) {
  const result = await WaitlistService.joinWaitlist(req.user.outlet_id, req.body);
  res.json({ success: true, data: result });
}

export async function callGuest(req: Request, res: Response) {
  const result = await WaitlistService.callGuest(req.params.id);
  res.json({ success: true, data: result });
}
