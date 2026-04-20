"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = require("./logger");
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
logger_1.logger.info(`Initializing Redis with URL: ${redisUrl.split('@')[1] || 'localhost'}`);
exports.redis = new ioredis_1.default(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    reconnectOnError(err) {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            return true;
        }
        return false;
    }
});
exports.redis.on('connect', () => {
    logger_1.logger.info('Redis connection established');
});
exports.redis.on('ready', () => {
    logger_1.logger.info('Redis is ready to receive commands');
});
exports.redis.on('error', (err) => {
    logger_1.logger.error('Redis error occurred:', err.message);
});
exports.redis.on('reconnecting', () => {
    logger_1.logger.info('Redis is reconnecting...');
});
