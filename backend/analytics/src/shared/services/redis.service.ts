import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor(private readonly configService: ConfigService) {
    this.client = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      keyPrefix: this.configService.get<string>('REDIS_KEY_PREFIX', 'analytics:'),
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
    } catch (error) {
      this.logger.error('Failed to initialize Redis client:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
    this.logger.log('Redis client disconnected');
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Failed to get key ${key}:`, error);
      throw error;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.set(key, value, 'EX', ttl);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Failed to set key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.error(`Failed to delete key ${key}:`, error);
      throw error;
    }
  }

  async sadd(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.sadd(key, ...members);
    } catch (error) {
      this.logger.error(`Failed to add members to set ${key}:`, error);
      throw error;
    }
  }

  async srem(key: string, ...members: string[]): Promise<void> {
    try {
      await this.client.srem(key, ...members);
    } catch (error) {
      this.logger.error(`Failed to remove members from set ${key}:`, error);
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      this.logger.error(`Failed to get members of set ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence of key ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, seconds: number): Promise<void> {
    try {
      await this.client.expire(key, seconds);
    } catch (error) {
      this.logger.error(`Failed to set expiry for key ${key}:`, error);
      throw error;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Failed to get keys matching pattern ${pattern}:`, error);
      throw error;
    }
  }
} 