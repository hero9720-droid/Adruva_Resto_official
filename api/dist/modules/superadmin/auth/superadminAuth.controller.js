"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.setup2FA = setup2FA;
exports.verify2FA = verify2FA;
const bcrypt_1 = __importDefault(require("bcrypt"));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { authenticator } = require('otplib');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const qrcode = require('qrcode');
const db_1 = require("../../../lib/db");
const jwt_1 = require("../../../lib/jwt");
const errors_1 = require("../../../lib/errors");
async function login(req, res) {
    const { email, password } = req.body;
    const result = await db_1.db.query('SELECT id, name, email, password_hash, totp_secret, totp_enabled FROM superadmin_users WHERE email = $1', [email]);
    const admin = result.rows[0];
    console.log('Login attempt:', { email, totp_enabled: admin?.totp_enabled });
    if (!admin) {
        throw new errors_1.AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, admin.password_hash);
    if (!isPasswordValid) {
        throw new errors_1.AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    if (!admin.totp_enabled) {
        const accessToken = (0, jwt_1.signAccessToken)({
            superadmin_id: admin.id,
            role: 'superadmin',
            totp_verified: true
        });
        return res.json({
            success: true,
            accessToken,
            totpEnabled: false
        });
    }
    // Generate partial JWT if 2FA is required
    const partialToken = (0, jwt_1.signAccessToken)({
        superadmin_id: admin.id,
        role: 'superadmin',
        step: 'password_verified',
        totp_verified: false
    });
    res.json({
        success: true,
        partialToken,
        totpEnabled: true
    });
}
async function setup2FA(req, res) {
    // Only allowed if user has password_verified partial token
    if (req.user.step !== 'password_verified') {
        throw new errors_1.AppError(403, 'Password verification required', 'FORBIDDEN');
    }
    const admin_id = req.user.superadmin_id;
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri('admin@adruvaresto.com', 'AdruvaResto', secret);
    const qrCodeDataUrl = await qrcode.toDataURL(otpauth);
    // Store secret temporarily in DB (unverified)
    await db_1.db.query('UPDATE superadmin_users SET totp_secret = $1 WHERE id = $2', [secret, admin_id]);
    res.json({
        success: true,
        qrCode: qrCodeDataUrl,
        secret // Optional: show manual entry code
    });
}
async function verify2FA(req, res) {
    const { token } = req.body;
    const admin_id = req.user.superadmin_id;
    const result = await db_1.db.query('SELECT totp_secret FROM superadmin_users WHERE id = $1', [admin_id]);
    const secret = result.rows[0]?.totp_secret;
    if (!secret) {
        throw new errors_1.AppError(400, '2FA setup not initiated', '2FA_NOT_SETUP');
    }
    const isValid = authenticator.verify({ token, secret });
    if (!isValid) {
        throw new errors_1.AppError(401, 'Invalid TOTP token', 'INVALID_TOTP');
    }
    // Mark 2FA as enabled in DB
    await db_1.db.query('UPDATE superadmin_users SET totp_enabled = true WHERE id = $1', [admin_id]);
    // Issue FULL access token
    const fullToken = (0, jwt_1.signAccessToken)({
        superadmin_id: admin_id,
        role: 'superadmin',
        totp_verified: true
    });
    res.json({
        success: true,
        accessToken: fullToken
    });
}
