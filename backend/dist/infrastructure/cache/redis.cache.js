"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisCacheService = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const environment_1 = require("../../config/environment");
const di_container_1 = require("../../api/di-container");
exports.redis = new ioredis_1.default(environment_1.env.REDIS_URL);
exports.redis.on('connect', () => {
    di_container_1.logger.info('[RedisCacheService] Connection established.');
});
exports.redis.on('error', (err) => {
    di_container_1.logger.error('[RedisCacheService] Connection error:', err);
});
class RedisCacheService {
    async get(key) {
        try {
            const val = await exports.redis.get(key);
            return val ? JSON.parse(val) : null;
        }
        catch (e) {
            di_container_1.logger.error(`[RedisCacheService] Error getting cache key ${key}:`, e);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            const stringVal = JSON.stringify(value);
            if (ttlSeconds) {
                await exports.redis.set(key, stringVal, 'EX', ttlSeconds);
            }
            else {
                await exports.redis.set(key, stringVal);
            }
        }
        catch (e) {
            di_container_1.logger.error(`[RedisCacheService] Error setting cache key ${key}:`, e);
        }
    }
    async del(key) {
        try {
            await exports.redis.del(key);
        }
        catch (e) {
            di_container_1.logger.error(`[RedisCacheService] Error deleting cache key ${key}:`, e);
        }
    }
    async delPattern(pattern) {
        try {
            const keys = await exports.redis.keys(pattern);
            if (keys.length > 0) {
                await exports.redis.del(...keys);
            }
        }
        catch (e) {
            di_container_1.logger.error(`[RedisCacheService] Error deleting pattern ${pattern}:`, e);
        }
    }
}
exports.RedisCacheService = RedisCacheService;
