"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCampaign = createCampaign;
exports.getCampaigns = getCampaigns;
exports.executeCampaign = executeCampaign;
const db_1 = require("../../lib/db");
const errors_1 = require("../../lib/errors");
const notifications_1 = require("../../lib/notifications");
async function createCampaign(req, res) {
    const chain_id = req.user.chain_id;
    const { name, template_body, audience_filter } = req.body;
    const result = await db_1.db.query(`INSERT INTO marketing_campaigns (chain_id, name, template_body, audience_filter)
     VALUES ($1, $2, $3, $4) RETURNING *`, [chain_id, name, template_body, audience_filter || {}]);
    res.status(201).json({ success: true, data: result.rows[0] });
}
async function getCampaigns(req, res) {
    const chain_id = req.user.chain_id;
    const result = await db_1.db.query('SELECT * FROM marketing_campaigns WHERE chain_id = $1 ORDER BY created_at DESC', [chain_id]);
    res.json({ success: true, data: result.rows });
}
async function executeCampaign(req, res) {
    const { id } = req.params;
    const chain_id = req.user.chain_id;
    const campaignRes = await db_1.db.query('SELECT * FROM marketing_campaigns WHERE id = $1 AND chain_id = $2', [id, chain_id]);
    if (campaignRes.rowCount === 0)
        throw new errors_1.AppError(404, 'Campaign not found', 'NOT_FOUND');
    const campaign = campaignRes.rows[0];
    if (campaign.status === 'completed')
        throw new errors_1.AppError(400, 'Campaign already completed', 'BAD_REQUEST');
    // Mark as active
    await db_1.db.query("UPDATE marketing_campaigns SET status = 'active' WHERE id = $1", [id]);
    // Audience Segmentation Logic
    const filter = campaign.audience_filter;
    let audienceQuery = 'SELECT phone, name FROM customers WHERE chain_id = $1 AND phone IS NOT NULL';
    const params = [chain_id];
    if (filter.min_points) {
        params.push(filter.min_points);
        audienceQuery += ` AND loyalty_points >= $${params.length}`;
    }
    const customers = await db_1.db.query(audienceQuery, params);
    let sentCount = 0;
    // Execute in background (simulated)
    for (const customer of customers.rows) {
        const personalizedMessage = campaign.template_body
            .replace('{{name}}', customer.name)
            .replace('{{loyalty_points}}', customer.loyalty_points || '0');
        await (0, notifications_1.sendWhatsAppMessage)(customer.phone, personalizedMessage);
        sentCount++;
    }
    // Complete
    await db_1.db.query("UPDATE marketing_campaigns SET status = 'completed', sent_count = $1, updated_at = NOW() WHERE id = $2", [sentCount, id]);
    res.json({ success: true, message: `Campaign executed. ${sentCount} messages sent.` });
}
