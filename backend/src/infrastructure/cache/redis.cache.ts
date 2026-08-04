import Redis from 'ioredis';
import { ICacheService } from '../../application/services/cache.service';
import { env } from '../../config/environment';
import { logger } from '../../api/di-container';

export const redis = new Redis(env.REDIS_URL);

redis.on('connect', () => {
  logger.info('[RedisCacheService] Connection established.');
});

redis.on('error', (err) => {
  logger.error('[RedisCacheService] Connection error:', err);
});

export class RedisCacheService implements ICacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const val = await redis.get(key);
      return val ? JSON.parse(val) : null;
    } catch (e) {
      logger.error(`[RedisCacheService] Error getting cache key ${key}:`, e);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const stringVal = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.set(key, stringVal, 'EX', ttlSeconds);
      } else {
        await redis.set(key, stringVal);
      }
    } catch (e) {
      logger.error(`[RedisCacheService] Error setting cache key ${key}:`, e);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (e) {
      logger.error(`[RedisCacheService] Error deleting cache key ${key}:`, e);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (e) {
      logger.error(`[RedisCacheService] Error deleting pattern ${pattern}:`, e);
    }
  }

  async acquireLock(key: string, ttlSeconds: number = 60): Promise<boolean> {
    try {
      const result = await redis.set(key, 'LOCKED', 'EX', ttlSeconds, 'NX');
      return result === 'OK';
    } catch (e) {
      logger.error(`[RedisCacheService] Error acquiring lock ${key}:`, e);
      return false;
    }
  }

  async releaseLock(key: string): Promise<void> {
    try {
      await redis.del(key);
    } catch (e) {
      logger.error(`[RedisCacheService] Error releasing lock ${key}:`, e);
    }
  }
}
