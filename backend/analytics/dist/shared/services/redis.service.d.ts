import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly logger;
    private readonly client;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    sadd(key: string, ...members: string[]): Promise<void>;
    srem(key: string, ...members: string[]): Promise<void>;
    smembers(key: string): Promise<string[]>;
    exists(key: string): Promise<boolean>;
    expire(key: string, seconds: number): Promise<void>;
    keys(pattern: string): Promise<string[]>;
}
