"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrandAssets = getBrandAssets;
exports.updateBrandIdentity = updateBrandIdentity;
exports.uploadBrandAsset = uploadBrandAsset;
const db_1 = require("../../lib/db");
async function getBrandAssets(req, res) {
    const { chain_id } = req.params;
    const result = await db_1.db.query('SELECT * FROM brand_assets WHERE chain_id = $1 ORDER BY created_at DESC', [chain_id]);
    const identity = await db_1.db.query('SELECT brand_identity FROM chains WHERE id = $1', [chain_id]);
    res.json({
        success: true,
        data: {
            assets: result.rows,
            identity: identity.rows[0]?.brand_identity
        }
    });
}
async function updateBrandIdentity(req, res) {
    const { chain_id } = req.params;
    const { brand_identity } = req.body;
    const result = await db_1.db.query('UPDATE chains SET brand_identity = $1 WHERE id = $2 RETURNING brand_identity', [JSON.stringify(brand_identity), chain_id]);
    res.json({ success: true, data: result.rows[0].brand_identity });
}
async function uploadBrandAsset(req, res) {
    const { chain_id } = req.params;
    const { asset_type, url, metadata } = req.body;
    // Deactivate existing asset of same type
    await db_1.db.query('UPDATE brand_assets SET is_active = false WHERE chain_id = $1 AND asset_type = $2', [chain_id, asset_type]);
    const result = await db_1.db.query(`INSERT INTO brand_assets (chain_id, asset_type, url, is_active, metadata)
     VALUES ($1, $2, $3, true, $4) RETURNING *`, [chain_id, asset_type, url, JSON.stringify(metadata || {})]);
    res.status(201).json({ success: true, data: result.rows[0] });
}
