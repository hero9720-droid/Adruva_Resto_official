import { Request, Response } from 'express';
import { withOutletContext } from '../../lib/db';
import { AppError } from '../../lib/errors';

export async function getRooms(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `SELECT * FROM rooms WHERE outlet_id = $1 AND is_active = true ORDER BY name ASC`,
      [outlet_id]
    );
    return r.rows;
  });

  res.json({ success: true, data: result });
}

export async function createRoom(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { name, floor, capacity } = req.body;

  if (!name) throw new AppError(400, 'Room name is required', 'VALIDATION_ERROR');

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `INSERT INTO rooms (outlet_id, name, floor, capacity, status)
       VALUES ($1, $2, $3, $4, 'available') RETURNING *`,
      [outlet_id, name, floor, capacity || 2]
    );
    return r.rows[0];
  });

  res.status(201).json({ success: true, data: result });
}

export async function updateRoom(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { id } = req.params;
  const allowed = ['name', 'floor', 'capacity', 'status', 'guest_name', 'accumulated_paise', 'bill_status', 'is_active'];
  const updates = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  if (Object.keys(updates).length === 0) {
    throw new AppError(400, 'No valid fields to update', 'VALIDATION_ERROR');
  }

  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map((f, i) => `${f} = $${i + 3}`).join(', ');

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `UPDATE rooms SET ${setClause}, updated_at = NOW() WHERE id = $1 AND outlet_id = $2 RETURNING *`,
      [id, outlet_id, ...values]
    );
    if (r.rowCount === 0) throw new AppError(404, 'Room not found', 'NOT_FOUND');
    return r.rows[0];
  });

  res.json({ success: true, data: result });
}

export async function checkInGuest(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { id } = req.params;
  const { guest_name } = req.body;

  if (!guest_name) throw new AppError(400, 'Guest name is required', 'VALIDATION_ERROR');

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `UPDATE rooms 
       SET status = 'occupied', 
           guest_name = $1, 
           checked_in_at = NOW(), 
           accumulated_paise = 0,
           bill_status = 'pending'
       WHERE id = $2 AND outlet_id = $3 AND status = 'available'
       RETURNING *`,
      [guest_name, id, outlet_id]
    );
    if (r.rowCount === 0) throw new AppError(400, 'Room not available for check-in', 'INVALID_STATE');
    return r.rows[0];
  });

  res.json({ success: true, data: result });
}

export async function checkOutGuest(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { id } = req.params;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `UPDATE rooms 
       SET status = 'cleaning', 
           checked_out_at = NOW(), 
           bill_status = 'paid'
       WHERE id = $1 AND outlet_id = $2 AND status = 'occupied'
       RETURNING *`,
      [id, outlet_id]
    );
    if (r.rowCount === 0) throw new AppError(400, 'Room not occupied', 'INVALID_STATE');
    return r.rows[0];
  });

  res.json({ success: true, data: result });
}
