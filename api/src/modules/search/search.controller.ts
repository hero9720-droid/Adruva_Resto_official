import { Request, Response } from 'express';
import { withOutletContext } from '../../lib/db';

export async function globalSearch(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { query } = req.query;

  if (!query || String(query).length < 2) {
    return res.json({ success: true, data: { bills: [], orders: [], customers: [] } });
  }

  const searchTerm = `%${query}%`;

  const result = await withOutletContext(outlet_id, async (client) => {
    // 1. Search Bills
    const bills = await client.query(
      `SELECT id, bill_number, total_paise, status, created_at 
       FROM bills 
       WHERE outlet_id = $1 AND (bill_number::text ILIKE $2)
       LIMIT 5`,
      [outlet_id, searchTerm]
    );

    // 2. Search Orders
    const orders = await client.query(
      `SELECT id, order_number, status, total_paise, created_at 
       FROM orders 
       WHERE outlet_id = $1 AND (order_number::text ILIKE $2)
       LIMIT 5`,
      [outlet_id, searchTerm]
    );

    // 3. Search Customers
    const customers = await client.query(
      `SELECT id, name, phone, loyalty_points 
       FROM customers 
       WHERE outlet_id = $1 AND (name ILIKE $2 OR phone ILIKE $2)
       LIMIT 5`,
      [outlet_id, searchTerm]
    );

    return {
      bills: bills.rows,
      orders: orders.rows,
      customers: customers.rows
    };
  });

  res.json({ success: true, data: result });
}
