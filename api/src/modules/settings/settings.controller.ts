import { Request, Response } from 'express';
import { withOutletContext } from '../../lib/db';

export async function getOutletSettings(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `SELECT id, name, subdomain, address, phone, email, gstin,
              tax_rate_percent, service_charge_percent,
              currency, timezone, logo_url, created_at
       FROM outlets WHERE id = $1`,
      [outlet_id]
    );
    return r.rows[0];
  });

  res.json({ success: true, data: result });
}

export async function updateOutletSettings(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  // Only allow safe fields to be updated
  const allowed = ['name', 'address', 'phone', 'email', 'gstin', 'tax_rate_percent', 'service_charge_percent', 'currency', 'timezone', 'logo_url'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields to update' });
  }

  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setClause = fields.map((f, i) => `${f} = $${i + 2}`).join(', ');

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `UPDATE outlets SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [outlet_id, ...values]
    );
    return r.rows[0];
  });

  res.json({ success: true, data: result });
}

// Tables management (replaces floor_zones — zones don't exist in DB)
export async function getTables(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `SELECT id, name, capacity, status, pos_x, pos_y, shape, width, height, is_active, assigned_waiter_id
       FROM tables WHERE outlet_id = $1 AND is_active = true ORDER BY name ASC`,
      [outlet_id]
    );
    return r.rows;
  });

  res.json({ success: true, data: result });
}

export async function createTable(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { name, capacity = 4, pos_x = 0, pos_y = 0, shape = 'rectangle' } = req.body;

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `INSERT INTO tables (outlet_id, name, capacity, status, pos_x, pos_y, shape)
       VALUES ($1, $2, $3, 'available', $4, $5, $6) RETURNING *`,
      [outlet_id, name, capacity, pos_x, pos_y, shape]
    );
    return r.rows[0];
  });

  res.status(201).json({ success: true, data: result });
}

export async function updateTable(req: Request, res: Response) {
  const outlet_id = req.user.outlet_id;
  const { id }    = req.params;
  const allowed   = ['name', 'capacity', 'pos_x', 'pos_y', 'shape', 'status', 'is_active', 'width', 'height'];
  const updates   = Object.fromEntries(Object.entries(req.body).filter(([k]) => allowed.includes(k)));

  const fields    = Object.keys(updates);
  const values    = Object.values(updates);
  const setClause = fields.map((f, i) => `${f} = $${i + 3}`).join(', ');

  const result = await withOutletContext(outlet_id, async (client) => {
    const r = await client.query(
      `UPDATE tables SET ${setClause} WHERE id = $1 AND outlet_id = $2 RETURNING *`,
      [id, outlet_id, ...values]
    );
    return r.rows[0];
  });

  res.json({ success: true, data: result });
}

// Legacy zone endpoints (not used — floor_zones not in DB)
export async function getZones(req: Request, res: Response) {
  res.json({ success: true, data: [], message: 'Floor zones not configured. Use tables management.' });
}

export async function createZone(req: Request, res: Response) {
  res.status(501).json({ success: false, message: 'Floor zones not available in current schema' });
}

export async function getZoneTables(req: Request, res: Response) {
  return getTables(req, res);
}
