"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
exports.corsOptions = {
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin)
            return callback(null, true);
        const isVercel = origin.includes('.vercel.app');
        const isAdruva = origin.includes('.adruvaresto.com');
        const isLocal = origin.includes('localhost:');
        const allowedOriginsEnv = process.env.ALLOWED_ORIGINS?.split(',') || [];
        const isExplicitlyAllowed = allowedOriginsEnv.includes('*') || allowedOriginsEnv.includes(origin);
        if (isVercel || isAdruva || isLocal || isExplicitlyAllowed) {
            callback(null, true);
        }
        else {
            console.log(`CORS Blocked: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
