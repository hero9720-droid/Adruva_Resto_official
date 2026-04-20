"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const zod_1 = require("zod");
const errors_1 = require("../lib/errors");
const validateBody = (schema) => async (req, res, next) => {
    try {
        await schema.parseAsync(req.body);
        next();
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            const details = {};
            error.errors.forEach(err => {
                details[err.path.join('.')] = err.message;
            });
            throw new errors_1.AppError(400, 'Validation Error', 'VALIDATION_ERROR', details);
        }
        next(error);
    }
};
exports.validateBody = validateBody;
