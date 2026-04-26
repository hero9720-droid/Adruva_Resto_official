import { Request, Response } from 'express';
import { db } from '../../lib/db';
import { AppError } from '../../lib/errors';
import { sendWhatsAppMessage } from '../../lib/notifications';

export async function createCampaign(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const { name, template_body, audience_filter } = req.body;

  const result = await db.query(
    `INSERT INTO marketing_campaigns (chain_id, name, template_body, audience_filter)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [chain_id, name, template_body, audience_filter || {}]
  );

  res.status(201).json({ success: true, data: result.rows[0] });
}

export async function getCampaigns(req: Request, res: Response) {
  const chain_id = req.user.chain_id;
  const result = await db.query(
    'SELECT * FROM marketing_campaigns WHERE chain_id = $1 ORDER BY created_at DESC',
    [chain_id]
  );
  res.json({ success: true, data: result.rows });
}

export async function executeCampaign(req: Request, res: Response) {
  const { id } = req.params;
  const chain_id = req.user.chain_id;

  const campaignRes = await db.query(
    'SELECT * FROM marketing_campaigns WHERE id = $1 AND chain_id = $2',
    [id, chain_id]
  );
  if (campaignRes.rowCount === 0) throw new AppError(404, 'Campaign not found', 'NOT_FOUND');
  
  const campaign = campaignRes.rows[0];
  if (campaign.status === 'completed') throw new AppError(400, 'Campaign already completed', 'BAD_REQUEST');

  // Mark as active
  await db.query("UPDATE marketing_campaigns SET status = 'active' WHERE id = $1", [id]);

  // Audience Segmentation Logic
  const filter = campaign.audience_filter;
  let audienceQuery = 'SELECT phone, name FROM customers WHERE chain_id = $1 AND phone IS NOT NULL';
  const params: any[] = [chain_id];

  if (filter.min_points) {
    params.push(filter.min_points);
    audienceQuery += ` AND loyalty_points >= $${params.length}`;
  }

  const customers = await db.query(audienceQuery, params);
  let sentCount = 0;

  // Execute in background (simulated)
  for (const customer of customers.rows) {
    const personalizedMessage = campaign.template_body
      .replace('{{name}}', customer.name)
      .replace('{{loyalty_points}}', customer.loyalty_points || '0');
    
    await sendWhatsAppMessage(customer.phone, personalizedMessage);
    sentCount++;
  }

  // Complete
  await db.query(
    "UPDATE marketing_campaigns SET status = 'completed', sent_count = $1, updated_at = NOW() WHERE id = $2",
    [sentCount, id]
  );

  res.json({ success: true, message: `Campaign executed. ${sentCount} messages sent.` });
}
