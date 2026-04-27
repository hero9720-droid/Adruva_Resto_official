"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateCustomerTier = evaluateCustomerTier;
exports.getCustomerPass = getCustomerPass;
exports.getChainTiers = getChainTiers;
const db_1 = require("../../lib/db");
async function evaluateCustomerTier(customer_id) {
    const client = await db_1.db.connect();
    try {
        await client.query('BEGIN');
        // 1. Get customer and chain info
        const custRes = await client.query(`SELECT id, chain_id, lifetime_spend_paise, tier FROM customers WHERE id = $1`, [customer_id]);
        const customer = custRes.rows[0];
        // 2. Fetch all rules for this chain
        const rulesRes = await client.query(`SELECT * FROM loyalty_tier_rules WHERE chain_id = $1 ORDER BY min_spend_paise DESC`, [customer.chain_id]);
        const rules = rulesRes.rows;
        // 3. Find the highest tier they qualify for
        const spend = Number(customer.lifetime_spend_paise);
        const newTierRule = rules.find(r => spend >= Number(r.min_spend_paise));
        if (newTierRule && newTierRule.tier_name !== customer.tier) {
            await client.query(`UPDATE customers SET tier = $1 WHERE id = $2`, [newTierRule.tier_name, customer_id]);
            // LOG: Tier Upgrade Event
            await client.query(`
        INSERT INTO loyalty_transactions (customer_id, type, description, tier_at_time)
        VALUES ($1, 'tier_change', $2, $3)
      `, [customer_id, `Upgraded to ${newTierRule.tier_name}`, newTierRule.tier_name]);
        }
        await client.query('COMMIT');
        return newTierRule;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
async function getCustomerPass(customer_id) {
    const res = await db_1.db.query(`
    SELECT c.name, c.tier, c.loyalty_points, c.lifetime_spend_paise,
           r.perks_json, r.points_multiplier,
           (SELECT min_spend_paise FROM loyalty_tier_rules WHERE chain_id = c.chain_id AND min_spend_paise > r.min_spend_paise ORDER BY min_spend_paise ASC LIMIT 1) as next_tier_min
    FROM customers c
    JOIN loyalty_tier_rules r ON r.chain_id = c.chain_id AND r.tier_name = c.tier::text
    WHERE c.id = $1
  `, [customer_id]);
    return res.rows[0];
}
async function getChainTiers(chain_id) {
    const res = await db_1.db.query(`SELECT * FROM loyalty_tier_rules WHERE chain_id = $1 ORDER BY min_spend_paise ASC`, [chain_id]);
    return res.rows;
}
