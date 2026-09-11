import { Redis } from 'ioredis';

// Redis connection options
const redisOptions = {
  maxRetriesPerRequest: 3,
  retryDelayOnClusterDown: 100,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
};

// Redis connection for BullMQ and caching
export const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', redisOptions);

// BullMQ connection object (compatible with expected type)
export const bullmqConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  maxRetriesPerRequest: 3,
  retryDelayOnClusterDown: 100,
  lazyConnect: true,
  keepAlive: 30000,
  family: 4,
  keyPrefix: 'microinverter:',
};

// Redis connection for caching (separate instance)
export const redisCache = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  ...redisOptions,
  keyPrefix: 'cache:',
});

// Connection event handlers
redisConnection.on('connect', () => {
  console.log('Redis connected for BullMQ');
});

redisConnection.on('error', (error) => {
  console.error('Redis connection error (BullMQ):', error);
});

redisConnection.on('close', () => {
  console.log('Redis connection closed (BullMQ)');
});

redisCache.on('connect', () => {
  console.log('Redis connected for caching');
});

redisCache.on('error', (error) => {
  console.error('Redis connection error (cache):', error);
});

redisCache.on('close', () => {
  console.log('Redis connection closed (cache)');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await Promise.all([
    redisConnection.quit(),
    redisCache.quit(),
  ]);
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await Promise.all([
    redisConnection.quit(),
    redisCache.quit(),
  ]);
  process.exit(0);
});

export default redisConnection;
