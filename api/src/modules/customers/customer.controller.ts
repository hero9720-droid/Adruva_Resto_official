import { Request, Response } from 'express';
import { withOutletContext } from '../../lib/db';
import { AppError } from '../../lib/errors';
import { db } from '../../lib/db';

// DB schema: id, chain_id, name, phone, email, loyalty_points, lifetime_spend_paise, visit_count, last_visit_at, notes
// customers is chain-wide, NOT outlet-scoped

export async function getCustomers(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const { search, limit = '50', offset = '0' } = req.query;

  let query = `
    SELECT id, name, phone, email, loyalty_points, lifetime_spend_paise, visit_count, last_visit_at, notes
    FROM customers
    WHERE chain_id = $1
  `;
  const params: any[] = [chain_id];

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR phone ILIKE $${params.length})`;
  }

  query += ` ORDER BY visit_count DESC, last_visit_at DESC NULLS LAST LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(parseInt(limit as string), parseInt(offset as string));

  const result = await db.query(query, params);
  res.json({ success: true, data: result.rows });
}

export async function createOrUpdateCustomer(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  // DB columns: name, phone, email, notes
  const { name, phone, email, notes } = req.body;

  // Upsert by phone within chain
  const result = await db.query(
    `INSERT INTO customers (chain_id, name, phone, email, notes, loyalty_points, visit_count)
     VALUES ($1, $2, $3, $4, $5, 0, 0)
     ON CONFLICT (chain_id, phone) DO UPDATE
       SET name  = EXCLUDED.name,
           email = EXCLUDED.email,
           notes = EXCLUDED.notes,
           updated_at = NOW()
     RETURNING *`,
    [chain_id, name, phone, email, notes]
  );

  res.status(200).json({ success: true, data: result.rows[0] });
}

export async function getCustomerByPhone(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const { phone } = req.params;

  const result = await db.query(
    'SELECT * FROM customers WHERE chain_id = $1 AND phone = $2',
    [chain_id, phone]
  );

  res.json({ success: true, data: result.rows[0] || null });
}

export async function earnLoyaltyPoints(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const chain_id  = req.user.chain_id;
  const { customer_id, bill_id } = req.body;

  const result = await withOutletContext(outlet_id, async (client) => {
    const billRes = await client.query('SELECT total_paise FROM bills WHERE id = $1', [bill_id]);
    if ((billRes.rowCount ?? 0) === 0) throw new AppError(404, 'Bill not found', 'NOT_FOUND');

    // Fetch chain-wide loyalty earning rate (default 1pt / ₹100)
    const chainRes = await db.query('SELECT loyalty_config FROM chains WHERE id = $1', [chain_id]);
    const earnRate = chainRes.rows[0]?.loyalty_config?.earn_rate_paise || 10000;

    const points = Math.floor(billRes.rows[0].total_paise / earnRate);

    if (points > 0) {
      // Update customer points (chain-level)
      await db.query(
        `UPDATE customers
         SET loyalty_points = loyalty_points + $1,
             lifetime_spend_paise = lifetime_spend_paise + $2,
             visit_count = visit_count + 1,
             last_visit_at = NOW(),
             updated_at = NOW()
         WHERE id = $3`,
        [points, billRes.rows[0].total_paise, customer_id]
      );

      // Record in loyalty_transactions
      await client.query(
        `INSERT INTO loyalty_transactions (customer_id, chain_id, outlet_id, bill_id, type, points)
         VALUES ($1, $2, $3, $4, 'earn', $5)`,
        [customer_id, chain_id, outlet_id, bill_id, points]
      );
    }

    return { points_earned: points };
  });

  res.json({ success: true, data: result });
}

export async function redeemLoyaltyPoints(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const chain_id  = req.user.chain_id;
  const { customer_id, points, bill_id } = req.body;

  if (!points || points <= 0) throw new AppError(400, 'Invalid points to redeem', 'BAD_REQUEST');

  const result = await withOutletContext(outlet_id, async (client) => {
    // 1. Fetch chain config and customer points
    const chainRes = await db.query('SELECT loyalty_config FROM chains WHERE id = $1', [chain_id]);
    const config = chainRes.rows[0]?.loyalty_config || { points_to_paise: 100, max_redemption_percent: 50 };

    const customerRes = await db.query('SELECT loyalty_points FROM customers WHERE id = $1', [customer_id]);
    if ((customerRes.rowCount ?? 0) === 0) throw new AppError(404, 'Customer not found', 'NOT_FOUND');
    
    if (customerRes.rows[0].loyalty_points < points) {
      throw new AppError(400, 'Insufficient loyalty points', 'INSUFFICIENT_POINTS');
    }

    // 2. Calculate point value
    const discount_paise = points * config.points_to_paise;

    // 3. Enforce Max Redemption Limit if bill provided
    if (bill_id) {
       const billRes = await client.query('SELECT total_paise FROM bills WHERE id = $1', [bill_id]);
       const billTotal = billRes.rows[0]?.total_paise || 0;
       
       const maxAllowedDiscount = (billTotal * config.max_redemption_percent) / 100;
       if (discount_paise > maxAllowedDiscount) {
         throw new AppError(400, `Max redemption exceeded. You can only use points for up to ${config.max_redemption_percent}% of the bill.`, 'REDEMPTION_LIMIT');
       }

       // Deduct points
       await db.query(
         `UPDATE customers SET loyalty_points = loyalty_points - $1, updated_at = NOW() WHERE id = $2`,
         [points, customer_id]
       );

       // Apply discount to bill
       await client.query(
         'UPDATE bills SET total_paise = total_paise - $1, updated_at = NOW() WHERE id = $2',
         [discount_paise, bill_id]
       );

       // Record redemption
       await client.query(
         `INSERT INTO loyalty_transactions (customer_id, chain_id, outlet_id, bill_id, type, points)
          VALUES ($1, $2, $3, $4, 'redeem', $5)`,
         [customer_id, chain_id, outlet_id, bill_id, points]
       );
    }

    return { points_redeemed: points, discount_applied: discount_paise };
  });

  res.json({ success: true, data: result });
}

export async function getCustomerHistory(req: Request, res: Response) {
  const { id } = req.params;
  const chain_id = req.user.chain_id;

  const customer = await db.query(
    'SELECT * FROM customers WHERE id = $1 AND chain_id = $2',
    [id, chain_id]
  );
  if ((customer.rowCount ?? 0) === 0) throw new AppError(404, 'Customer not found', 'NOT_FOUND');

  const bills = await db.query(
    `SELECT b.*,
       (SELECT json_agg(oi.*) FROM order_items oi WHERE oi.order_id = b.order_id) as items
     FROM bills b
     WHERE b.customer_id = $1
     ORDER BY b.created_at DESC
     LIMIT 20`,
    [id]
  );

  const transactions = await db.query(
    `SELECT lt.*, o.name as outlet_name
     FROM loyalty_transactions lt
     LEFT JOIN outlets o ON o.id = lt.outlet_id
     WHERE lt.customer_id = $1
     ORDER BY lt.created_at DESC
     LIMIT 50`,
    [id]
  );

  res.json({
    success: true,
    data: {
      customer: customer.rows[0],
      transactions: transactions.rows,
      bills: bills.rows,
    }
  });
}

export async function processReferral(req: Request, res: Response) {
  const { customer_id, referral_code } = req.body;
  const chain_id = req.user.chain_id;

  const result = await db.query(
    'SELECT id FROM customers WHERE referral_code = $1 AND chain_id = $2',
    [referral_code, chain_id]
  );
  
  if ((result.rowCount ?? 0) > 0) {
    const referrer_id = result.rows[0].id;
    if (referrer_id === customer_id) throw new AppError(400, 'Cannot refer yourself', 'BAD_REQUEST');

    await db.query(
      'UPDATE customers SET referred_by = $1 WHERE id = $2 AND referred_by IS NULL',
      [referrer_id, customer_id]
    );
  }

  res.json({ success: true, message: 'Referral processed' });
}

export async function getSocialProof(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    // 1. Get Top Rated (from feedback)
    const topRated = await client.query(`
      SELECT f.comment, f.rating_food, f.created_at, c.name as customer_name
      FROM customer_feedback f
      LEFT JOIN customers c ON c.id = f.customer_id
      WHERE f.outlet_id = $1 AND f.rating_food >= 4
      ORDER BY f.created_at DESC LIMIT 5
    `, [outlet_id]);

    // 2. Get Bestselling Items (from order_items)
    const bestsellers = await client.query(`
      SELECT mi.id, mi.name, COUNT(oi.id) as sales_count
      FROM order_items oi
      JOIN menu_items mi ON mi.id = oi.menu_item_id
      WHERE oi.outlet_id = $1
      GROUP BY mi.id, mi.name
      ORDER BY sales_count DESC LIMIT 5
    `, [outlet_id]);

    return { topRated: topRated.rows, bestsellers: bestsellers.rows };
  });

  res.json({ success: true, data: result });
}
