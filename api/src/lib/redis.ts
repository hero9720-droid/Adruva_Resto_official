import Redis from 'ioredis';
import { logger } from './logger';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

logger.info(`Initializing Redis with URL: ${redisUrl.split('@')[1] || 'localhost'}`);

export const redis = new Redis(redisUrl, {
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

redis.on('connect', () => {
  logger.info('Redis connection established');
});

redis.on('ready', () => {
  logger.info('Redis is ready to receive commands');
});

redis.on('error', (err) => {
  logger.error('Redis error occurred:', err.message);
});

redis.on('reconnecting', () => {
  logger.info('Redis is reconnecting...');
});
