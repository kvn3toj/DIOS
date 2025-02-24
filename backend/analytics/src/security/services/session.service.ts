import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { RedisService } from '../../shared/services/redis.service';
import * as crypto from 'crypto';

interface SessionMetadata {
  userId: string;
  createdAt: Date;
  lastActivity: Date;
  userAgent?: string;
  ip?: string;
  device?: string;
  platform?: string;
}

@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly sessionPrefix = 'session:';
  private readonly sessionTTL: number;
  private readonly maxConcurrentSessions: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.sessionTTL = this.configService.get<number>('SESSION_TTL', 86400); // 24 hours
    this.maxConcurrentSessions = this.configService.get<number>('MAX_CONCURRENT_SESSIONS', 5);
  }

  async createSession(
    userId: string,
    metadata: Partial<SessionMetadata> = {},
  ): Promise<string> {
    try {
      // Generate session ID
      const sessionId = crypto.randomBytes(32).toString('hex');
      const now = new Date();

      // Get user's active sessions
      const activeSessions = await this.getUserActiveSessions(userId);

      // Check if max concurrent sessions reached
      if (activeSessions.length >= this.maxConcurrentSessions) {
        // Remove oldest session
        const oldestSession = activeSessions[0];
        await this.destroySession(oldestSession);
      }

      // Create session data
      const sessionData: SessionMetadata = {
        userId,
        createdAt: now,
        lastActivity: now,
        ...metadata,
      };

      // Store session in Redis
      const key = this.getSessionKey(sessionId);
      await this.redisService.set(key, JSON.stringify(sessionData), this.sessionTTL);

      // Add to user's active sessions
      await this.redisService.sadd(`user_sessions:${userId}`, sessionId);

      this.eventEmitter.emit('session.created', {
        sessionId,
        userId,
        timestamp: now,
      });

      return sessionId;
    } catch (error) {
      this.logger.error('Failed to create session:', error);
      throw new Error('Failed to create session');
    }
  }

  async validateSession(sessionId: string): Promise<boolean> {
    try {
      const session = await this.getSession(sessionId);
      return !!session;
    } catch (error) {
      this.logger.error('Failed to validate session:', error);
      return false;
    }
  }

  async refreshSession(sessionId: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Update last activity
      session.lastActivity = new Date();

      // Update session in Redis
      const key = this.getSessionKey(sessionId);
      await this.redisService.set(key, JSON.stringify(session), this.sessionTTL);

      this.eventEmitter.emit('session.refreshed', {
        sessionId,
        userId: session.userId,
        timestamp: session.lastActivity,
      });
    } catch (error) {
      this.logger.error('Failed to refresh session:', error);
      throw error;
    }
  }

  async destroySession(sessionId: string): Promise<void> {
    try {
      const session = await this.getSession(sessionId);
      if (!session) {
        return;
      }

      // Remove session from Redis
      const key = this.getSessionKey(sessionId);
      await this.redisService.del(key);

      // Remove from user's active sessions
      await this.redisService.srem(`user_sessions:${session.userId}`, sessionId);

      this.eventEmitter.emit('session.destroyed', {
        sessionId,
        userId: session.userId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to destroy session:', error);
      throw error;
    }
  }

  async destroyUserSessions(userId: string): Promise<void> {
    try {
      const sessions = await this.getUserActiveSessions(userId);
      await Promise.all(sessions.map(sessionId => this.destroySession(sessionId)));

      this.eventEmitter.emit('session.user_sessions_destroyed', {
        userId,
        sessionCount: sessions.length,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to destroy user sessions:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<SessionMetadata | null> {
    try {
      const key = this.getSessionKey(sessionId);
      const data = await this.redisService.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      this.logger.error('Failed to get session:', error);
      throw error;
    }
  }

  async getUserActiveSessions(userId: string): Promise<string[]> {
    try {
      return await this.redisService.smembers(`user_sessions:${userId}`);
    } catch (error) {
      this.logger.error('Failed to get user active sessions:', error);
      throw error;
    }
  }

  private getSessionKey(sessionId: string): string {
    return `${this.sessionPrefix}${sessionId}`;
  }
} 