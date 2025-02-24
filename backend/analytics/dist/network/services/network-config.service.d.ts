import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class NetworkConfigService {
    private readonly configService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly networkConfig;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2);
    private initializeNetworkConfig;
    private loadEnvironmentConfig;
    private validateNetworkConfig;
    getHttpConfig(): {
        port: number;
        host: string;
        cors: {
            enabled: boolean;
            origins: string[];
            methods: string[];
            credentials: boolean;
        };
        compression: {
            enabled: boolean;
            level: number;
        };
        timeout: {
            read: number;
            write: number;
            idle: number;
        };
    };
    getWebSocketConfig(): {
        enabled: boolean;
        path: string;
        maxConnections: number;
        heartbeat: {
            interval: number;
            timeout: number;
        };
    };
    getLoadBalancingConfig(): {
        enabled: boolean;
        algorithm: string;
        healthCheck: {
            enabled: boolean;
            interval: number;
            path: string;
            timeout: number;
            unhealthyThreshold: number;
            healthyThreshold: number;
        };
        sticky: {
            enabled: boolean;
            cookieName: string;
        };
    };
    getSecurityConfig(): {
        ssl: {
            enabled: boolean;
            cert: string;
            key: string;
            minVersion: string;
        };
        ddos: {
            enabled: boolean;
            rateLimit: {
                windowMs: number;
                max: number;
            };
            blacklist: never[];
            whitelist: never[];
        };
        headers: {
            hsts: {
                enabled: boolean;
                maxAge: number;
                includeSubDomains: boolean;
                preload: boolean;
            };
            xframe: string;
            xssProtection: string;
            nosniff: boolean;
        };
    };
    getProxyConfig(): {
        enabled: boolean;
        trusted: string[];
        preserveHostHeader: boolean;
        timeout: number;
    };
    updateHttpConfig(updates: Partial<typeof this.networkConfig.http>): void;
    updateWebSocketConfig(updates: Partial<typeof this.networkConfig.websocket>): void;
    updateLoadBalancingConfig(updates: Partial<typeof this.networkConfig.loadBalancing>): void;
    updateSecurityConfig(updates: Partial<typeof this.networkConfig.security>): void;
    updateProxyConfig(updates: Partial<typeof this.networkConfig.proxy>): void;
}
