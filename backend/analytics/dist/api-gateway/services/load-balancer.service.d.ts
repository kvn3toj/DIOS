import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class LoadBalancerService implements OnModuleInit {
    private readonly configService;
    private endpoints;
    private healthCheckInterval;
    constructor(configService: ConfigService);
    onModuleInit(): Promise<void>;
    startHealthChecks(): Promise<void>;
    getEndpoint(serviceName: string): Promise<string>;
    releaseEndpoint(serviceName: string, url: string): Promise<void>;
    private roundRobin;
    private leastConnections;
    private random;
    addEndpoint(serviceName: string, url: string): Promise<void>;
    removeEndpoint(serviceName: string, url: string): Promise<void>;
    onModuleDestroy(): void;
}
