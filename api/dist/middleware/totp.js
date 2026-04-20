"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTOTP = requireTOTP;
const errors_1 = require("../lib/errors");
function requireTOTP(req, res, next) {
    if (req.user?.role === 'superadmin' && req.user?.totp_verified !== true) {
        throw new errors_1.AppError(403, '2FA verification required', '2FA_REQUIRED');
    }
    next();
}
