import { Request, Response } from 'express';
import { withOutletContext } from '../../lib/db';
import { getNextBillNumber } from '../../lib/counters';
import { emitToBilling } from '../../websocket';
import { AppError } from '../../lib/errors';
import { awardLoyaltyPoints } from '../../lib/loyalty';

export async function getBillsList(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { status, limit = '50', offset = '0' } = req.query;

  const result = await withOutletContext(outlet_id, async (client) => {
    const params: any[] = [outlet_id];
    let query = `
      SELECT b.*, s.name as created_by_name,
        (SELECT json_agg(pt.*) FROM payment_transactions pt WHERE pt.bill_id = b.id) as payments
      FROM bills b
      LEFT JOIN staff s ON s.id = b.created_by
      WHERE b.outlet_id = $1
    `;
    if (status) {
      params.push(status);
      query += ` AND b.status = $${params.length}`;
    }
    query += ` ORDER BY b.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string), parseInt(offset as string));
    const r = await client.query(query, params);
    return r.rows;
  });

  res.json({ success: true, data: result });
}

export async function generateBill(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const staff_id = req.user.staff_id;
  const {
    order_id, // Switched to single order_id to match schema
    discount_paise = 0,
    discount_type,
    service_charge_paise = 0,
    gst_5_paise = 0,
    gst_12_paise = 0,
    gst_18_paise = 0,
    coupon_code,
    customer_id,
  } = req.body;

  if (!order_id) {
    throw new AppError(400, 'order_id is required', 'INVALID_INPUT');
  }

  try {
    const result = await withOutletContext(outlet_id, async (client) => {
      // 1. Next bill number
      const bill_number = await getNextBillNumber(client, outlet_id);

      // 2. Subtotal from order items
      const itemsRes = await client.query(
        `SELECT COALESCE(SUM(total_paise), 0)::bigint AS subtotal FROM order_items WHERE order_id = $1`,
        [order_id]
      );
      const subtotal = Number(itemsRes.rows[0].subtotal);
      
      const d_paise = Number(discount_paise || 0);
      const sc_paise = Number(service_charge_paise || 0);
      const g5 = Number(gst_5_paise || 0);
      const g12 = Number(gst_12_paise || 0);
      const g18 = Number(gst_18_paise || 0);
      const total_paise = subtotal + sc_paise + g5 + g12 + g18 - d_paise;

      // 3. Create bill
      const billRes = await client.query(
        `INSERT INTO bills (
           outlet_id, bill_number, order_id, subtotal_paise, discount_paise,
           discount_type, coupon_code, service_charge_paise,
           gst_5_paise, gst_12_paise, gst_18_paise,
           total_paise, customer_id, created_by, status
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,'open') RETURNING *`,
        [
          outlet_id, bill_number, order_id, subtotal, d_paise,
          discount_type ?? null, coupon_code ?? null, sc_paise,
          g5, g12, g18,
          total_paise, customer_id ?? null, staff_id
        ]
      );
      const bill = billRes.rows[0];

      // 4. Update order status
      await client.query(
        'UPDATE orders SET status = $1 WHERE id = $2',
        ['served', order_id]
      );

      return bill;
    });

    emitToBilling(outlet_id, 'bill:new', result);
    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    console.error('BILL_GEN_CRASH_LOG:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

export async function recordPayment(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { bill_id, payment_method, amount_paise } = req.body;

  try {
    const result = await withOutletContext(outlet_id, async (client) => {
      // 1. Record payment in payment_transactions
      const paymentRes = await client.query(
        `INSERT INTO payment_transactions (outlet_id, bill_id, method, amount_paise, status)
         VALUES ($1, $2, $3, $4, 'captured') RETURNING *`,
        [outlet_id, bill_id, payment_method, amount_paise]
      );

      // 2. Check if bill is fully paid
      const totalPaidRes = await client.query(
        `SELECT COALESCE(SUM(amount_paise), 0)::bigint AS paid
         FROM payment_transactions
         WHERE bill_id = $1 AND status = 'captured'`,
        [bill_id]
      );
      const paidAmount = Number(totalPaidRes.rows[0].paid);

      const billLookup = await client.query('SELECT total_paise, order_id, customer_id FROM bills WHERE id = $1', [bill_id]);
      if (billLookup.rowCount === 0) throw new AppError(404, 'Bill not found', 'NOT_FOUND');
      
      const billTotal = Number(billLookup.rows[0].total_paise);
      const order_id = billLookup.rows[0].order_id;
      const customer_id = billLookup.rows[0].customer_id;

      // 3. Mark bill paid if fully covered
      if (paidAmount >= billTotal) {
        await client.query(
          `UPDATE bills SET status = 'paid', paid_paise = $1, updated_at = NOW() WHERE id = $2`,
          [paidAmount, bill_id]
        );
        
        // 4. Award Loyalty Points
        if (customer_id) {
          const outletRes = await client.query('SELECT chain_id FROM outlets WHERE id = $1', [outlet_id]);
          const chain_id = outletRes.rows[0].chain_id;
          await awardLoyaltyPoints(client, outlet_id, chain_id, customer_id, bill_id, billTotal);
        }

        if (order_id) {
          // Update table to available
          await client.query(
            `UPDATE tables SET status = 'available'
             WHERE id IN (SELECT table_id FROM orders WHERE id = $1)`,
            [order_id]
          );
        }
      }

      return paymentRes.rows[0];
    });

    emitToBilling(outlet_id, 'payment:recorded', result);
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('PAYMENT_CRASH_LOG:', error);
    res.status(error.statusCode || 500).json({ success: false, message: error.message });
  }
}

export async function splitBill(req: Request, res: Response) {
  const { id } = req.params;
  const { splits } = req.body; // Array of { split_type, amount_paise }
  const outlet_id = req.user.outlet_id;

  if (!Array.isArray(splits) || splits.length === 0) {
    throw new AppError(400, 'Invalid splits array', 'INVALID_INPUT');
  }

  const result = await withOutletContext(outlet_id, async (client) => {
    const billRes = await client.query('SELECT * FROM bills WHERE id = $1', [id]);
    if (billRes.rowCount === 0) throw new AppError(404, 'Bill not found', 'NOT_FOUND');
    const bill = billRes.rows[0];

    const totalSplit = splits.reduce((acc: number, curr: any) => acc + curr.amount_paise, 0);
    if (totalSplit !== bill.total_paise) {
      throw new AppError(400, `Splits total (${totalSplit}) must equal bill total (${bill.total_paise})`, 'VALIDATION_ERROR');
    }

    await client.query('DELETE FROM bill_splits WHERE parent_bill_id = $1', [id]);

    const createdSplits = [];
    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];
      const splitRes = await client.query(
        `INSERT INTO bill_splits (outlet_id, parent_bill_id, split_index, label, subtotal_paise, status)
         VALUES ($1, $2, $3, $4, $5, 'unpaid') RETURNING *`,
        [outlet_id, id, i + 1, split.split_type || 'equal', split.amount_paise]
      );
      createdSplits.push(splitRes.rows[0]);
    }
    return createdSplits;
  });

  res.json({ success: true, data: result });
}

export async function getBillDetails(req: Request, res: Response) {
  const { id } = req.params;
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    const billRes = await client.query(`
      SELECT b.*, 
             c.loyalty_points as customer_loyalty_points, 
             c.name as customer_name 
      FROM bills b 
      LEFT JOIN customers c ON c.id = b.customer_id 
      WHERE b.id = $1
    `, [id]);
    if ((billRes.rowCount ?? 0) === 0) throw new AppError(404, 'Bill not found', 'NOT_FOUND');

    const bill = billRes.rows[0];

    // Join order items for the linked order
    const ordersRes = await client.query(
      `SELECT o.*,
         (SELECT json_agg(oi.*) FROM order_items oi WHERE oi.order_id = o.id) AS items
       FROM orders o WHERE o.id = $1`,
      [bill.order_id]
    );

    const paymentsRes = await client.query(
      'SELECT * FROM payment_transactions WHERE bill_id = $1 ORDER BY created_at ASC',
      [id]
    );

    const splitsRes = await client.query(
      'SELECT * FROM bill_splits WHERE parent_bill_id = $1 ORDER BY created_at ASC',
      [id]
    );

    return {
      ...bill,
      orders:   ordersRes.rows,
      payments: paymentsRes.rows,
      splits:   splitsRes.rows,
    };
  });

  res.json({ success: true, data: result });
}
