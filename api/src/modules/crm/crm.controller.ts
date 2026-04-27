import { Request, Response } from 'express';
import * as CRMService from './crm.service';
import * as CLVService from './clv.service';

// --- CUSTOMER LIFETIME VALUE (CLV) & PREDICTIVE ANALYTICS ---

export async function getCLVSegments(req: Request, res: Response) {
  const result = await CLVService.getCLVSegments(req.user.chain_id);
  res.json({ success: true, data: result });
}

export async function getAtRiskWhales(req: Request, res: Response) {
  const result = await CLVService.getAtRiskWhales(req.user.chain_id);
  res.json({ success: true, data: result });
}

export async function syncCLVData(req: Request, res: Response) {
  await CLVService.calculateCLVMetrics(req.user.chain_id);
  res.json({ success: true, message: 'CLV data synchronized' });
}

export async function getInsights(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const insights = await CRMService.getCustomerInsights(chain_id);
  res.json({ success: true, data: insights });
}

export async function runSegmentation(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  await CRMService.updateCustomerSegments(chain_id);
  res.json({ success: true, message: 'Customer segments updated based on behavioral data.' });
}

export async function processAutomated(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const result = await CRMService.processDailyAutomatedMarketing(chain_id);
  res.json({ success: true, data: result });
}
