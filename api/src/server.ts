import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { logger } from './lib/logger';
import { corsOptions } from './middleware/cors';
import { errorHandler } from './middleware/errorHandler';
import { initWebSocket } from './websocket';
import routes from './routes';

const app = express();
const server = http.createServer(app);

// Proxy support for Railway/Vercel
app.set('trust proxy', 1);

// Standard Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS - Must be before routes and other middleware
app.use(cors(corsOptions));

// Security Middleware (Disable crossOriginResourcePolicy for CORS compatibility)
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Routes
app.use('/api', routes);

// Error Handling
app.use(errorHandler);

// Initialize WebSocket
initWebSocket(server).then(() => {
  const PORT = Number(process.env.PORT) || 4000;
  server.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT} (host: 0.0.0.0)`);
  });
}).catch(err => {
  logger.error('Failed to initialize WebSocket', err);
  process.exit(1);
});