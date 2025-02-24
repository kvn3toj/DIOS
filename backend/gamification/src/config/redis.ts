import { createClient } from 'redis';
import { logger } from '../utils/logger';

const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (error) => {
  logger.error('Redis Client Error:', error);
});

redisClient.on('connect', () => {
  logger.info('Redis client connected');
});

redisClient.on('reconnecting', () => {
  logger.info('Redis client reconnecting');
});

export const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error('Error connecting to Redis:', error);
    throw error;
  }
};

export const disconnectRedis = async () => {
  try {
    await redisClient.quit();
    logger.info('Redis connection closed');
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
    throw error;
  }
};

// Helper functions for common Redis operations
export const redisSet = async (key: string, value: any, expireSeconds?: number) => {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    if (expireSeconds) {
      await redisClient.setEx(key, expireSeconds, stringValue);
    } else {
      await redisClient.set(key, stringValue);
    }
  } catch (error) {
    logger.error('Redis set error:', error);
    throw error;
  }
};

export const redisGet = async <T>(key: string): Promise<T | null> => {
  try {
    const value = await redisClient.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  } catch (error) {
    logger.error('Redis get error:', error);
    throw error;
  }
};

export const redisDelete = async (key: string) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error('Redis delete error:', error);
    throw error;
  }
};

export { redisClient }; 