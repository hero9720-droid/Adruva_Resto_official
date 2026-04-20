"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const logger_1 = require("./lib/logger");
const cors_2 = require("./middleware/cors");
const errorHandler_1 = require("./middleware/errorHandler");
const websocket_1 = require("./websocket");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Security Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)(cors_2.corsOptions));
// Standard Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api', routes_1.default);
// Error Handling
app.use(errorHandler_1.errorHandler);
// Initialize WebSocket
(0, websocket_1.initWebSocket)(server).then(() => {
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => {
        logger_1.logger.info(`Server running on port ${PORT}`);
    });
}).catch(err => {
    logger_1.logger.error('Failed to initialize WebSocket', err);
    process.exit(1);
});
