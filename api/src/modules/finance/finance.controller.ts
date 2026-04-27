import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';
import * as TaxService from './tax.service';
import * as PnLService from './pnl.service';

// --- P&L & ANALYTICS ---

export async function getLivePnL(req: Request, res: Response) {
  const result = await PnLService.getLivePnL(req.user.outlet_id, Number(req.query.month_offset || 0));
  res.json({ success: true, data: result });
}

export async function getFinancialProjections(req: Request, res: Response) {
  const result = await PnLService.getFinancialProjections(req.user.outlet_id);
  res.json({ success: true, data: result });
}

// --- TAX SLAB MANAGEMENT ---

export async function createTaxSlab(req: Request, res: Response) {
  const { name, percentage, tax_code, is_inclusive } = req.body;
  const outlet_id = req.user.outlet_id;

  const result = await db.query(
    `INSERT INTO tax_slabs (outlet_id, name, percentage, tax_code, is_inclusive)
     VALUES ($1, $2, $3, $4, $5) 
     ON CONFLICT (outlet_id, tax_code) DO UPDATE 
     SET percentage = EXCLUDED.percentage, name = EXCLUDED.name, is_inclusive = EXCLUDED.is_inclusive
     RETURNING *`,
    [outlet_id, name, percentage, tax_code, is_inclusive]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
}

export async function getTaxSlabs(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const result = await db.query(
    'SELECT * FROM tax_slabs WHERE outlet_id = $1 AND is_active = TRUE ORDER BY percentage ASC',
    [outlet_id]
  );
  res.json({ success: true, data: result.rows });
}

// --- COMPLIANCE REPORTING ---

export async function getTaxSummary(req: Request, res: Response) {
  const { start_date, end_date } = req.query;
  const outlet_id = req.user.outlet_id;

  const result = await TaxService.getTaxSummaryReport(
    outlet_id, 
    new Date(start_date as string || '1970-01-01'), 
    new Date(end_date as string || '2099-12-31')
  );

  res.json({ success: true, data: result });
}

export async function updateComplianceInfo(req: Request, res: Response) {
  const { gstin, fssai_license, vat_number, tax_config } = req.body;
  const outlet_id = req.user.outlet_id;

  await db.query(`
    UPDATE outlets 
    SET gstin = $1, fssai_license = $2, vat_number = $3, tax_config = $4
    WHERE id = $5
  `, [gstin, fssai_license, vat_number, JSON.stringify(tax_config), outlet_id]);

  res.json({ success: true, message: 'Compliance information updated.' });
}
