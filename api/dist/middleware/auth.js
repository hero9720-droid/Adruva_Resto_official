"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jwt_1 = require("../lib/jwt");
const errors_1 = require("../lib/errors");
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new errors_1.AppError(401, 'Authentication required', 'UNAUTHENTICATED');
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.user = payload;
        next();
    }
    catch (err) {
        throw new errors_1.AppError(401, 'Invalid or expired token', 'INVALID_TOKEN');
    }
}
