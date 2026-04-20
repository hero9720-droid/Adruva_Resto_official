"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
exports.refresh = refresh;
const bcrypt_1 = __importDefault(require("bcrypt"));
const db_1 = require("../../../lib/db");
const redis_1 = require("../../../lib/redis");
const jwt_1 = require("../../../lib/jwt");
const errors_1 = require("../../../lib/errors");
async function login(req, res) {
    const { email, password } = req.body;
    const result = await db_1.db.query('SELECT id, chain_id, name, email, password_hash, role, is_active FROM chain_users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user || !user.is_active) {
        throw new errors_1.AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new errors_1.AppError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }
    const payload = {
        chain_user_id: user.id,
        chain_id: user.chain_id,
        role: user.role
    };
    const accessToken = (0, jwt_1.signAccessToken)(payload);
    const refreshToken = (0, jwt_1.signRefreshToken)(payload);
    await redis_1.redis.setex(`refresh_token:chain:${user.id}`, 30 * 24 * 60 * 60, refreshToken);
    res.cookie('chainRefreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000
    });
    res.json({
        success: true,
        accessToken,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            chain_id: user.chain_id
        }
    });
}
async function refresh(req, res) {
    const refreshToken = req.cookies.chainRefreshToken;
    if (!refreshToken) {
        throw new errors_1.AppError(401, 'Refresh token missing', 'REFRESH_TOKEN_MISSING');
    }
    try {
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        const storedToken = await redis_1.redis.get(`refresh_token:chain:${payload.chain_user_id}`);
        if (storedToken !== refreshToken) {
            throw new errors_1.AppError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
        }
        const newAccessToken = (0, jwt_1.signAccessToken)({
            chain_user_id: payload.chain_user_id,
            chain_id: payload.chain_id,
            role: payload.role
        });
        res.json({
            success: true,
            accessToken: newAccessToken
        });
    }
    catch (err) {
        throw new errors_1.AppError(401, 'Invalid refresh token', 'INVALID_REFRESH_TOKEN');
    }
}
