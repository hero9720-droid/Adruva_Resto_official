import { Request, Response } from 'express';
import * as ApprovalService from './approval.service';

export async function getPendingApprovals(req: Request, res: Response) {
  const result = await ApprovalService.getPendingApprovals(req.user.outlet_id);
  res.json({ success: true, data: result });
}

export async function decideApproval(req: Request, res: Response) {
  const { decision, comments } = req.body;
  const result = await ApprovalService.processDecision(req.params.id, req.user.staff_id, decision, comments);
  res.json({ success: true, data: result });
}
