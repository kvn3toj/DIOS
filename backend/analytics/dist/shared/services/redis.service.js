"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const ioredis_1 = require("ioredis");
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
        this.client = new ioredis_1.default({
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: this.configService.get('REDIS_PORT', 6379),
            password: this.configService.get('REDIS_PASSWORD'),
            db: this.configService.get('REDIS_DB', 0),
            keyPrefix: this.configService.get('REDIS_KEY_PREFIX', 'analytics:'),
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
        });
        this.client.on('error', (error) => {
            this.logger.error('Redis client error:', error);
        });
    }
    async onModuleInit() {
        try {
            await this.client.ping();
            this.logger.log('Redis client initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize Redis client:', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.client.quit();
        this.logger.log('Redis client disconnected');
    }
    async get(key) {
        try {
            return await this.client.get(key);
        }
        catch (error) {
            this.logger.error(`Failed to get key ${key}:`, error);
            throw error;
        }
    }
    async set(key, value, ttl) {
        try {
            if (ttl) {
                await this.client.set(key, value, 'EX', ttl);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (error) {
            this.logger.error(`Failed to set key ${key}:`, error);
            throw error;
        }
    }
    async del(key) {
        try {
            await this.client.del(key);
        }
        catch (error) {
            this.logger.error(`Failed to delete key ${key}:`, error);
            throw error;
        }
    }
    async sadd(key, ...members) {
        try {
            await this.client.sadd(key, ...members);
        }
        catch (error) {
            this.logger.error(`Failed to add members to set ${key}:`, error);
            throw error;
        }
    }
    async srem(key, ...members) {
        try {
            await this.client.srem(key, ...members);
        }
        catch (error) {
            this.logger.error(`Failed to remove members from set ${key}:`, error);
            throw error;
        }
    }
    async smembers(key) {
        try {
            return await this.client.smembers(key);
        }
        catch (error) {
            this.logger.error(`Failed to get members of set ${key}:`, error);
            throw error;
        }
    }
    async exists(key) {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            this.logger.error(`Failed to check existence of key ${key}:`, error);
            throw error;
        }
    }
    async expire(key, seconds) {
        try {
            await this.client.expire(key, seconds);
        }
        catch (error) {
            this.logger.error(`Failed to set expiry for key ${key}:`, error);
            throw error;
        }
    }
    async keys(pattern) {
        try {
            return await this.client.keys(pattern);
        }
        catch (error) {
            this.logger.error(`Failed to get keys matching pattern ${pattern}:`, error);
            throw error;
        }
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map