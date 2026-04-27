"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpaceQR = getSpaceQR;
exports.rotateQRSecret = rotateQRSecret;
const db_1 = require("../../lib/db");
const crypto_1 = require("../../lib/crypto");
const errors_1 = require("../../lib/errors");
/**
 * Generates a signed QR link for a table or room.
 * This is used by the staff in the Spaces Hub.
 */
async function getSpaceQR(req, res) {
    const { spaceId } = req.params;
    const outletId = req.user.outlet_id;
    try {
        // 1. Get the secret for this outlet
        const outletRes = await db_1.db.query(`SELECT qr_secret, subdomain FROM outlets WHERE id = $1`, [outletId]);
        if (outletRes.rows.length === 0) {
            throw new errors_1.AppError(404, 'Outlet not found', 'NOT_FOUND');
        }
        const { qr_secret, subdomain } = outletRes.rows[0];
        // 2. Generate signed token
        const token = (0, crypto_1.signQR)(outletId, spaceId, qr_secret);
        // 3. Construct the full URL for the customer-app
        // In production, this would be https://menu.adruvaresto.com/qr/token
        // Or if custom domain exists, use that.
        const baseUrl = process.env.CUSTOMER_APP_URL || 'http://localhost:3003';
        const qrUrl = `${baseUrl}/qr/${token}`;
        res.json({
            success: true,
            data: {
                spaceId,
                token,
                qrUrl
            }
        });
    }
    catch (err) {
        console.error('Generate QR Error:', err);
        res.status(500).json({ success: false, error: 'Failed to generate QR signature.' });
    }
}
/**
 * Regenerates the outlet's QR secret, effectively invalidating all old QR codes.
 */
async function rotateQRSecret(req, res) {
    const outletId = req.user.outlet_id;
    const crypto = require('crypto');
    const newSecret = crypto.randomBytes(32).toString('hex');
    await db_1.db.query(`UPDATE outlets SET qr_secret = $1, updated_at = NOW() WHERE id = $2`, [newSecret, outletId]);
    res.json({
        success: true,
        message: 'QR security key rotated. All physical QR codes printed before today are now invalid.'
    });
}
