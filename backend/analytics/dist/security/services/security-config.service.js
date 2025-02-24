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
var SecurityConfigService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
let SecurityConfigService = SecurityConfigService_1 = class SecurityConfigService {
    constructor(configService, eventEmitter) {
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(SecurityConfigService_1.name);
        this.authConfig = {
            jwt: {
                enabled: true,
                expiresIn: '24h',
                refreshExpiresIn: '7d',
                algorithm: 'HS256',
                issuer: 'superapp-gamifier',
                audience: ['web', 'mobile'],
            },
            mfa: {
                enabled: true,
                methods: ['totp', 'email'],
                totpWindow: 1,
                maxAttempts: 3,
                blockDuration: 300,
            },
            passwordPolicy: {
                minLength: 12,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                maxAge: 90,
                preventReuse: 5,
            },
        };
        this.authzConfig = {
            rbac: {
                enabled: true,
                superAdminRole: 'SUPER_ADMIN',
                defaultRole: 'USER',
                hierarchical: true,
            },
            permissions: {
                granular: true,
                wildcards: true,
                inheritance: true,
            },
            policies: {
                enforceAll: true,
                auditAll: true,
                maxCacheAge: 300,
            },
        };
        this.dataSecurityConfig = {
            encryption: {
                algorithm: 'AES-256-GCM',
                keyRotation: 30,
                saltRounds: 10,
            },
            pii: {
                fields: ['email', 'phone', 'address', 'socialSecurity'],
                encryption: true,
                masking: true,
                retention: 365,
            },
            audit: {
                enabled: true,
                retention: 90,
                detailedLogging: true,
            },
        };
        this.rateLimitConfig = {
            global: {
                windowMs: 15 * 60 * 1000,
                max: 100,
            },
            auth: {
                windowMs: 60 * 60 * 1000,
                max: 5,
            },
            api: {
                windowMs: 60 * 1000,
                max: 60,
            },
        };
        this.initializeSecurityConfig();
    }
    initializeSecurityConfig() {
        try {
            this.loadEnvironmentConfig();
            this.validateSecurityConfig();
            this.eventEmitter.emit('security.config.loaded', {
                timestamp: new Date(),
                config: {
                    auth: this.authConfig,
                    authz: this.authzConfig,
                    dataSecurity: this.dataSecurityConfig,
                    rateLimit: this.rateLimitConfig,
                },
            });
            this.logger.log('Security configuration initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize security configuration', error);
            throw error;
        }
    }
    loadEnvironmentConfig() {
        if (this.configService.get('JWT_EXPIRES_IN')) {
            this.authConfig.jwt.expiresIn = this.configService.get('JWT_EXPIRES_IN');
        }
        if (this.configService.get('JWT_REFRESH_EXPIRES_IN')) {
            this.authConfig.jwt.refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN');
        }
        if (this.configService.get('MFA_ENABLED')) {
            this.authConfig.mfa.enabled = this.configService.get('MFA_ENABLED') === 'true';
        }
        if (this.configService.get('MFA_MAX_ATTEMPTS')) {
            this.authConfig.mfa.maxAttempts = parseInt(this.configService.get('MFA_MAX_ATTEMPTS'), 10);
        }
        if (this.configService.get('PASSWORD_MIN_LENGTH')) {
            this.authConfig.passwordPolicy.minLength = parseInt(this.configService.get('PASSWORD_MIN_LENGTH'), 10);
        }
        if (this.configService.get('PASSWORD_MAX_AGE')) {
            this.authConfig.passwordPolicy.maxAge = parseInt(this.configService.get('PASSWORD_MAX_AGE'), 10);
        }
        if (this.configService.get('RATE_LIMIT_WINDOW_MS')) {
            this.rateLimitConfig.global.windowMs = parseInt(this.configService.get('RATE_LIMIT_WINDOW_MS'), 10);
        }
        if (this.configService.get('RATE_LIMIT_MAX_REQUESTS')) {
            this.rateLimitConfig.global.max = parseInt(this.configService.get('RATE_LIMIT_MAX_REQUESTS'), 10);
        }
    }
    validateSecurityConfig() {
        if (!this.authConfig.jwt.enabled) {
            this.logger.warn('JWT authentication is disabled');
        }
        if (this.authConfig.jwt.expiresIn === '24h' && process.env.NODE_ENV === 'production') {
            this.logger.warn('Using default JWT expiration time in production');
        }
        if (!this.authConfig.mfa.enabled && process.env.NODE_ENV === 'production') {
            this.logger.warn('MFA is disabled in production environment');
        }
        if (this.authConfig.passwordPolicy.minLength < 12 && process.env.NODE_ENV === 'production') {
            this.logger.warn('Password minimum length is less than recommended (12 characters)');
        }
        if (this.rateLimitConfig.global.max > 100 && process.env.NODE_ENV === 'production') {
            this.logger.warn('Global rate limit is higher than recommended (100 requests)');
        }
    }
    getAuthConfig() {
        return { ...this.authConfig };
    }
    getAuthzConfig() {
        return { ...this.authzConfig };
    }
    getDataSecurityConfig() {
        return { ...this.dataSecurityConfig };
    }
    getRateLimitConfig() {
        return { ...this.rateLimitConfig };
    }
    updateAuthConfig(updates) {
        this.authConfig.jwt = { ...this.authConfig.jwt, ...updates.jwt };
        this.authConfig.mfa = { ...this.authConfig.mfa, ...updates.mfa };
        this.authConfig.passwordPolicy = { ...this.authConfig.passwordPolicy, ...updates.passwordPolicy };
        this.validateSecurityConfig();
        this.eventEmitter.emit('security.config.updated', { type: 'auth', updates });
    }
    updateAuthzConfig(updates) {
        this.authzConfig.rbac = { ...this.authzConfig.rbac, ...updates.rbac };
        this.authzConfig.permissions = { ...this.authzConfig.permissions, ...updates.permissions };
        this.authzConfig.policies = { ...this.authzConfig.policies, ...updates.policies };
        this.validateSecurityConfig();
        this.eventEmitter.emit('security.config.updated', { type: 'authz', updates });
    }
    updateDataSecurityConfig(updates) {
        this.dataSecurityConfig.encryption = { ...this.dataSecurityConfig.encryption, ...updates.encryption };
        this.dataSecurityConfig.pii = { ...this.dataSecurityConfig.pii, ...updates.pii };
        this.dataSecurityConfig.audit = { ...this.dataSecurityConfig.audit, ...updates.audit };
        this.validateSecurityConfig();
        this.eventEmitter.emit('security.config.updated', { type: 'dataSecurity', updates });
    }
    updateRateLimitConfig(updates) {
        this.rateLimitConfig.global = { ...this.rateLimitConfig.global, ...updates.global };
        this.rateLimitConfig.auth = { ...this.rateLimitConfig.auth, ...updates.auth };
        this.rateLimitConfig.api = { ...this.rateLimitConfig.api, ...updates.api };
        this.validateSecurityConfig();
        this.eventEmitter.emit('security.config.updated', { type: 'rateLimit', updates });
    }
};
exports.SecurityConfigService = SecurityConfigService;
exports.SecurityConfigService = SecurityConfigService = SecurityConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], SecurityConfigService);
//# sourceMappingURL=security-config.service.js.map