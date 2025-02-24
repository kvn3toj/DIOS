import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from '../../shared/services/redis.service';
interface SessionMetadata {
    userId: string;
    createdAt: Date;
    lastActivity: Date;
    userAgent?: string;
    ip?: string;
    device?: string;
    platform?: string;
}
export declare class SessionService {
    private readonly configService;
    private readonly redisService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly sessionPrefix;
    private readonly sessionTTL;
    private readonly maxConcurrentSessions;
    constructor(configService: ConfigService, redisService: RedisService, eventEmitter: EventEmitter2);
    createSession(userId: string, metadata?: Partial<SessionMetadata>): Promise<string>;
    validateSession(sessionId: string): Promise<boolean>;
    refreshSession(sessionId: string): Promise<void>;
    destroySession(sessionId: string): Promise<void>;
    destroyUserSessions(userId: string): Promise<void>;
    getSession(sessionId: string): Promise<SessionMetadata | null>;
    getUserActiveSessions(userId: string): Promise<string[]>;
    private getSessionKey;
}
export {};
