import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class SecurityConfigService {
    private readonly configService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly authConfig;
    private readonly authzConfig;
    private readonly dataSecurityConfig;
    private readonly rateLimitConfig;
    constructor(configService: ConfigService, eventEmitter: EventEmitter2);
    private initializeSecurityConfig;
    private loadEnvironmentConfig;
    private validateSecurityConfig;
    getAuthConfig(): {
        jwt: {
            enabled: boolean;
            expiresIn: string;
            refreshExpiresIn: string;
            algorithm: string;
            issuer: string;
            audience: string[];
        };
        mfa: {
            enabled: boolean;
            methods: string[];
            totpWindow: number;
            maxAttempts: number;
            blockDuration: number;
        };
        passwordPolicy: {
            minLength: number;
            requireUppercase: boolean;
            requireLowercase: boolean;
            requireNumbers: boolean;
            requireSpecialChars: boolean;
            maxAge: number;
            preventReuse: number;
        };
    };
    getAuthzConfig(): {
        rbac: {
            enabled: boolean;
            superAdminRole: string;
            defaultRole: string;
            hierarchical: boolean;
        };
        permissions: {
            granular: boolean;
            wildcards: boolean;
            inheritance: boolean;
        };
        policies: {
            enforceAll: boolean;
            auditAll: boolean;
            maxCacheAge: number;
        };
    };
    getDataSecurityConfig(): {
        encryption: {
            algorithm: string;
            keyRotation: number;
            saltRounds: number;
        };
        pii: {
            fields: string[];
            encryption: boolean;
            masking: boolean;
            retention: number;
        };
        audit: {
            enabled: boolean;
            retention: number;
            detailedLogging: boolean;
        };
    };
    getRateLimitConfig(): {
        global: {
            windowMs: number;
            max: number;
        };
        auth: {
            windowMs: number;
            max: number;
        };
        api: {
            windowMs: number;
            max: number;
        };
    };
    updateAuthConfig(updates: Partial<typeof this.authConfig>): void;
    updateAuthzConfig(updates: Partial<typeof this.authzConfig>): void;
    updateDataSecurityConfig(updates: Partial<typeof this.dataSecurityConfig>): void;
    updateRateLimitConfig(updates: Partial<typeof this.rateLimitConfig>): void;
}
