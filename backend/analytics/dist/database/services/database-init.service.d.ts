import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Connection } from 'typeorm';
import { DatabaseMonitoringService } from '../../monitoring/services/database-monitoring.service';
export declare class DatabaseInitService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly eventEmitter;
    private readonly databaseMonitoringService;
    private readonly logger;
    private connection;
    private healthCheckInterval;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2, databaseMonitoringService: DatabaseMonitoringService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private initializeDatabase;
    private getDatabaseConfig;
    private initializeConnectionPool;
    private startHealthCheck;
    private reconnect;
    private closeDatabase;
    getConnection(): Promise<Connection>;
    checkConnection(): Promise<boolean>;
}
