"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const errors_1 = require("../lib/errors");
function requireRole(allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            throw new errors_1.AppError(403, 'Insufficient permissions', 'FORBIDDEN');
        }
        next();
    };
}
