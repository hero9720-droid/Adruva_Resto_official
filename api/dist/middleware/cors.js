"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const db_1 = require("../lib/db");
exports.corsOptions = {
    origin: async (origin, callback) => {
        if (!origin)
            return callback(null, true);
        // Always allow our own *.adruvaresto.com domains
        if (/\.adruvaresto\.com$/.test(origin))
            return callback(null, true);
        // Always allow local dev
        const localOrigins = [
            'http://localhost:3000',
            'http://localhost:3001',
            'http://localhost:3002',
            'http://localhost:3003'
        ];
        if (localOrigins.includes(origin))
            return callback(null, true);
        // Dynamic: check DB for registered custom domains
        try {
            const hostname = new URL(origin).hostname;
            const result = await db_1.db.query('SELECT id FROM outlets WHERE custom_domain = $1 AND is_active = true', [hostname]);
            if (result.rows.length > 0)
                return callback(null, true);
        }
        catch {
            // invalid URL or DB error
        }
        callback(new Error('CORS: origin not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
