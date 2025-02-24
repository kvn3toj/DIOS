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
var SessionService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const redis_service_1 = require("../../shared/services/redis.service");
const crypto = require("crypto");
let SessionService = SessionService_1 = class SessionService {
    constructor(configService, redisService, eventEmitter) {
        this.configService = configService;
        this.redisService = redisService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(SessionService_1.name);
        this.sessionPrefix = 'session:';
        this.sessionTTL = this.configService.get('SESSION_TTL', 86400);
        this.maxConcurrentSessions = this.configService.get('MAX_CONCURRENT_SESSIONS', 5);
    }
    async createSession(userId, metadata = {}) {
        try {
            const sessionId = crypto.randomBytes(32).toString('hex');
            const now = new Date();
            const activeSessions = await this.getUserActiveSessions(userId);
            if (activeSessions.length >= this.maxConcurrentSessions) {
                const oldestSession = activeSessions[0];
                await this.destroySession(oldestSession);
            }
            const sessionData = {
                userId,
                createdAt: now,
                lastActivity: now,
                ...metadata,
            };
            const key = this.getSessionKey(sessionId);
            await this.redisService.set(key, JSON.stringify(sessionData), this.sessionTTL);
            await this.redisService.sadd(`user_sessions:${userId}`, sessionId);
            this.eventEmitter.emit('session.created', {
                sessionId,
                userId,
                timestamp: now,
            });
            return sessionId;
        }
        catch (error) {
            this.logger.error('Failed to create session:', error);
            throw new Error('Failed to create session');
        }
    }
    async validateSession(sessionId) {
        try {
            const session = await this.getSession(sessionId);
            return !!session;
        }
        catch (error) {
            this.logger.error('Failed to validate session:', error);
            return false;
        }
    }
    async refreshSession(sessionId) {
        try {
            const session = await this.getSession(sessionId);
            if (!session) {
                throw new Error('Session not found');
            }
            session.lastActivity = new Date();
            const key = this.getSessionKey(sessionId);
            await this.redisService.set(key, JSON.stringify(session), this.sessionTTL);
            this.eventEmitter.emit('session.refreshed', {
                sessionId,
                userId: session.userId,
                timestamp: session.lastActivity,
            });
        }
        catch (error) {
            this.logger.error('Failed to refresh session:', error);
            throw error;
        }
    }
    async destroySession(sessionId) {
        try {
            const session = await this.getSession(sessionId);
            if (!session) {
                return;
            }
            const key = this.getSessionKey(sessionId);
            await this.redisService.del(key);
            await this.redisService.srem(`user_sessions:${session.userId}`, sessionId);
            this.eventEmitter.emit('session.destroyed', {
                sessionId,
                userId: session.userId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to destroy session:', error);
            throw error;
        }
    }
    async destroyUserSessions(userId) {
        try {
            const sessions = await this.getUserActiveSessions(userId);
            await Promise.all(sessions.map(sessionId => this.destroySession(sessionId)));
            this.eventEmitter.emit('session.user_sessions_destroyed', {
                userId,
                sessionCount: sessions.length,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to destroy user sessions:', error);
            throw error;
        }
    }
    async getSession(sessionId) {
        try {
            const key = this.getSessionKey(sessionId);
            const data = await this.redisService.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            this.logger.error('Failed to get session:', error);
            throw error;
        }
    }
    async getUserActiveSessions(userId) {
        try {
            return await this.redisService.smembers(`user_sessions:${userId}`);
        }
        catch (error) {
            this.logger.error('Failed to get user active sessions:', error);
            throw error;
        }
    }
    getSessionKey(sessionId) {
        return `${this.sessionPrefix}${sessionId}`;
    }
};
exports.SessionService = SessionService;
exports.SessionService = SessionService = SessionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        redis_service_1.RedisService, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], SessionService);
//# sourceMappingURL=session.service.js.map