"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("express-async-errors");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const logger_1 = require("./lib/logger");
const cors_2 = require("./middleware/cors");
const errorHandler_1 = require("./middleware/errorHandler");
const websocket_1 = require("./websocket");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Proxy support for Railway/Vercel
app.set('trust proxy', 1);
// Standard Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// CORS - Must be before routes and other middleware
app.use((0, cors_1.default)(cors_2.corsOptions));
// Security Middleware (Disable crossOriginResourcePolicy for CORS compatibility)
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false,
}));
// Routes
app.use('/api', routes_1.default);
// Error Handling
app.use(errorHandler_1.errorHandler);
// Initialize WebSocket
(0, websocket_1.initWebSocket)(server).then(() => {
    const PORT = Number(process.env.PORT) || 4000;
    server.listen(PORT, '0.0.0.0', () => {
        logger_1.logger.info(`Server running on port ${PORT} (host: 0.0.0.0)`);
    });
}).catch(err => {
    logger_1.logger.error('Failed to initialize WebSocket', err);
    process.exit(1);
});
