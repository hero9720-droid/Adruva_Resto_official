import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';

export async function getSuppliers(req: Request, res: Response) {
  const { chain_id } = req.params;
  const result = await db.query(
    'SELECT * FROM suppliers WHERE chain_id = $1 ORDER BY name ASC',
    [chain_id]
  );
  res.json({ success: true, data: result.rows });
}

export async function getSupplierLedger(req: Request, res: Response) {
  const { supplier_id } = req.params;
  const result = await db.query(
    `SELECT sl.*, o.name as outlet_name 
     FROM supplier_ledgers sl
     LEFT JOIN outlets o ON o.id = sl.outlet_id
     WHERE sl.supplier_id = $1 
     ORDER BY sl.created_at DESC LIMIT 100`,
    [supplier_id]
  );
  res.json({ success: true, data: result.rows });
}

export async function recordVendorPayment(req: Request, res: Response) {
  const { supplier_id } = req.params;
  const { amount_paise, description, outlet_id } = req.body;

  await db.query('BEGIN');
  try {
    // 1. Get current balance
    const lastEntry = await db.query(
      'SELECT balance_after_paise FROM supplier_ledgers WHERE supplier_id = $1 ORDER BY created_at DESC LIMIT 1',
      [supplier_id]
    );
    const currentBalance = (lastEntry.rowCount && lastEntry.rowCount > 0) ? BigInt(lastEntry.rows[0].balance_after_paise) : BigInt(0);
    const newBalance = currentBalance - BigInt(amount_paise);

    // 2. Record DEBIT (Payment)
    const result = await db.query(
      `INSERT INTO supplier_ledgers (supplier_id, outlet_id, type, amount_paise, description, balance_after_paise)
       VALUES ($1, $2, 'DEBIT', $3, $4, $5) RETURNING *`,
      [supplier_id, outlet_id, amount_paise, description, newBalance.toString()]
    );

    await db.query('COMMIT');
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    await db.query('ROLLBACK');
    throw err;
  }
}

export async function getBulkVendorDues(req: Request, res: Response) {
  const { chain_id } = req.params;
  const result = await db.query(
    `SELECT s.id, s.name, 
       (SELECT balance_after_paise FROM supplier_ledgers WHERE supplier_id = s.id ORDER BY created_at DESC LIMIT 1) as outstanding_balance_paise
     FROM suppliers s
     WHERE s.chain_id = $1`,
    [chain_id]
  );
  res.json({ success: true, data: result.rows });
}
