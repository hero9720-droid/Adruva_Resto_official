"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const errors_1 = require("../lib/errors");
const logger_1 = require("../lib/logger");
function errorHandler(err, req, res, next) {
    if (err instanceof errors_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            code: err.code,
            details: err.details,
        });
    }
    logger_1.logger.error('Unhandled Error', err);
    return res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        code: 'INTERNAL_SERVER_ERROR',
    });
}
