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
var NetworkConfigService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
let NetworkConfigService = NetworkConfigService_1 = class NetworkConfigService {
    constructor(configService, eventEmitter) {
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(NetworkConfigService_1.name);
        this.networkConfig = {
            http: {
                port: 3000,
                host: '0.0.0.0',
                cors: {
                    enabled: true,
                    origins: ['http://localhost:3000'],
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                    credentials: true,
                },
                compression: {
                    enabled: true,
                    level: 6,
                },
                timeout: {
                    read: 5000,
                    write: 5000,
                    idle: 10000,
                },
            },
            websocket: {
                enabled: true,
                path: '/ws',
                maxConnections: 1000,
                heartbeat: {
                    interval: 30000,
                    timeout: 60000,
                },
            },
            loadBalancing: {
                enabled: true,
                algorithm: 'round-robin',
                healthCheck: {
                    enabled: true,
                    interval: 10000,
                    path: '/health',
                    timeout: 2000,
                    unhealthyThreshold: 3,
                    healthyThreshold: 2,
                },
                sticky: {
                    enabled: true,
                    cookieName: 'srv_id',
                },
            },
            security: {
                ssl: {
                    enabled: true,
                    cert: 'path/to/cert',
                    key: 'path/to/key',
                    minVersion: 'TLSv1.2',
                },
                ddos: {
                    enabled: true,
                    rateLimit: {
                        windowMs: 15 * 60 * 1000,
                        max: 100,
                    },
                    blacklist: [],
                    whitelist: [],
                },
                headers: {
                    hsts: {
                        enabled: true,
                        maxAge: 31536000,
                        includeSubDomains: true,
                        preload: true,
                    },
                    xframe: 'SAMEORIGIN',
                    xssProtection: '1; mode=block',
                    nosniff: true,
                },
            },
            proxy: {
                enabled: false,
                trusted: ['127.0.0.1'],
                preserveHostHeader: true,
                timeout: 5000,
            },
        };
        this.initializeNetworkConfig();
    }
    initializeNetworkConfig() {
        try {
            this.loadEnvironmentConfig();
            this.validateNetworkConfig();
            this.eventEmitter.emit('network.config.loaded', {
                timestamp: new Date(),
                config: this.networkConfig,
            });
            this.logger.log('Network configuration initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize network configuration', error);
            throw error;
        }
    }
    loadEnvironmentConfig() {
        if (this.configService.get('HTTP_PORT')) {
            this.networkConfig.http.port = parseInt(this.configService.get('HTTP_PORT'), 10);
        }
        if (this.configService.get('HTTP_HOST')) {
            this.networkConfig.http.host = this.configService.get('HTTP_HOST');
        }
        if (this.configService.get('CORS_ORIGINS')) {
            this.networkConfig.http.cors.origins = this.configService.get('CORS_ORIGINS').split(',');
        }
        if (this.configService.get('WS_ENABLED')) {
            this.networkConfig.websocket.enabled = this.configService.get('WS_ENABLED') === 'true';
        }
        if (this.configService.get('WS_MAX_CONNECTIONS')) {
            this.networkConfig.websocket.maxConnections = parseInt(this.configService.get('WS_MAX_CONNECTIONS'), 10);
        }
        if (this.configService.get('LB_ENABLED')) {
            this.networkConfig.loadBalancing.enabled = this.configService.get('LB_ENABLED') === 'true';
        }
        if (this.configService.get('LB_ALGORITHM')) {
            this.networkConfig.loadBalancing.algorithm = this.configService.get('LB_ALGORITHM');
        }
        if (this.configService.get('SSL_ENABLED')) {
            this.networkConfig.security.ssl.enabled = this.configService.get('SSL_ENABLED') === 'true';
        }
        if (this.configService.get('SSL_CERT')) {
            this.networkConfig.security.ssl.cert = this.configService.get('SSL_CERT');
        }
        if (this.configService.get('SSL_KEY')) {
            this.networkConfig.security.ssl.key = this.configService.get('SSL_KEY');
        }
    }
    validateNetworkConfig() {
        if (this.networkConfig.http.port < 0 || this.networkConfig.http.port > 65535) {
            throw new Error('Invalid HTTP port number');
        }
        if (this.networkConfig.websocket.enabled) {
            if (this.networkConfig.websocket.maxConnections <= 0) {
                this.logger.warn('WebSocket max connections should be greater than 0');
            }
        }
        if (this.networkConfig.loadBalancing.enabled) {
            if (!['round-robin', 'least-connections', 'ip-hash'].includes(this.networkConfig.loadBalancing.algorithm)) {
                throw new Error('Invalid load balancing algorithm');
            }
        }
        if (this.networkConfig.security.ssl.enabled) {
            if (!this.networkConfig.security.ssl.cert || !this.networkConfig.security.ssl.key) {
                throw new Error('SSL certificate and key are required when SSL is enabled');
            }
        }
    }
    getHttpConfig() {
        return { ...this.networkConfig.http };
    }
    getWebSocketConfig() {
        return { ...this.networkConfig.websocket };
    }
    getLoadBalancingConfig() {
        return { ...this.networkConfig.loadBalancing };
    }
    getSecurityConfig() {
        return { ...this.networkConfig.security };
    }
    getProxyConfig() {
        return { ...this.networkConfig.proxy };
    }
    updateHttpConfig(updates) {
        this.networkConfig.http = { ...this.networkConfig.http, ...updates };
        this.validateNetworkConfig();
        this.eventEmitter.emit('network.config.updated', { type: 'http', updates });
    }
    updateWebSocketConfig(updates) {
        this.networkConfig.websocket = { ...this.networkConfig.websocket, ...updates };
        this.validateNetworkConfig();
        this.eventEmitter.emit('network.config.updated', { type: 'websocket', updates });
    }
    updateLoadBalancingConfig(updates) {
        this.networkConfig.loadBalancing = { ...this.networkConfig.loadBalancing, ...updates };
        this.validateNetworkConfig();
        this.eventEmitter.emit('network.config.updated', { type: 'loadBalancing', updates });
    }
    updateSecurityConfig(updates) {
        this.networkConfig.security = { ...this.networkConfig.security, ...updates };
        this.validateNetworkConfig();
        this.eventEmitter.emit('network.config.updated', { type: 'security', updates });
    }
    updateProxyConfig(updates) {
        this.networkConfig.proxy = { ...this.networkConfig.proxy, ...updates };
        this.validateNetworkConfig();
        this.eventEmitter.emit('network.config.updated', { type: 'proxy', updates });
    }
};
exports.NetworkConfigService = NetworkConfigService;
exports.NetworkConfigService = NetworkConfigService = NetworkConfigService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], NetworkConfigService);
//# sourceMappingURL=network-config.service.js.map