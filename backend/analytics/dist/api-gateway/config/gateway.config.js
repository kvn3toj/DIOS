"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('gateway', () => ({
    services: {
        gamification: {
            url: process.env.GAMIFICATION_SERVICE_URL || 'http://localhost:3000',
            version: process.env.GAMIFICATION_SERVICE_VERSION || '1.0.0',
            timeout: parseInt(process.env.GAMIFICATION_SERVICE_TIMEOUT, 10) || 5000
        },
        social: {
            url: process.env.SOCIAL_SERVICE_URL || 'http://localhost:3001',
            version: process.env.SOCIAL_SERVICE_VERSION || '1.0.0',
            timeout: parseInt(process.env.SOCIAL_SERVICE_TIMEOUT, 10) || 5000
        },
        analytics: {
            url: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3002',
            version: process.env.ANALYTICS_SERVICE_VERSION || '1.0.0',
            timeout: parseInt(process.env.ANALYTICS_SERVICE_TIMEOUT, 10) || 5000
        }
    },
    cache: {
        enabled: process.env.GATEWAY_CACHE_ENABLED === 'true',
        ttl: parseInt(process.env.GATEWAY_CACHE_TTL, 10) || 300,
        max: parseInt(process.env.GATEWAY_CACHE_MAX_ITEMS, 10) || 1000
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60000,
        max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
    },
    circuitBreaker: {
        failureThreshold: parseInt(process.env.CIRCUIT_BREAKER_FAILURE_THRESHOLD, 10) || 5,
        resetTimeout: parseInt(process.env.CIRCUIT_BREAKER_RESET_TIMEOUT, 10) || 30000
    },
    cors: {
        enabled: process.env.CORS_ENABLED === 'true',
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
    },
    security: {
        rateLimit: {
            enabled: process.env.SECURITY_RATE_LIMIT_ENABLED === 'true',
            windowMs: parseInt(process.env.SECURITY_RATE_LIMIT_WINDOW_MS, 10) || 900000,
            max: parseInt(process.env.SECURITY_RATE_LIMIT_MAX_REQUESTS, 10) || 100
        },
        helmet: {
            enabled: process.env.SECURITY_HELMET_ENABLED === 'true',
            hidePoweredBy: true,
            noSniff: true,
            xssFilter: true
        }
    },
    monitoring: {
        metrics: {
            enabled: process.env.MONITORING_METRICS_ENABLED === 'true',
            interval: parseInt(process.env.MONITORING_METRICS_INTERVAL, 10) || 60000
        },
        healthCheck: {
            enabled: process.env.MONITORING_HEALTH_CHECK_ENABLED === 'true',
            interval: parseInt(process.env.MONITORING_HEALTH_CHECK_INTERVAL, 10) || 30000
        }
    },
    discovery: {
        enabled: process.env.SERVICE_DISCOVERY_ENABLED === 'true',
        provider: process.env.SERVICE_DISCOVERY_PROVIDER || 'consul',
        refreshInterval: parseInt(process.env.SERVICE_DISCOVERY_REFRESH_INTERVAL, 10) || 60000
    },
    loadBalancing: {
        enabled: process.env.LOAD_BALANCING_ENABLED === 'true',
        strategy: process.env.LOAD_BALANCING_STRATEGY || 'round-robin',
        healthCheck: {
            enabled: process.env.LOAD_BALANCING_HEALTH_CHECK_ENABLED === 'true',
            interval: parseInt(process.env.LOAD_BALANCING_HEALTH_CHECK_INTERVAL, 10) || 10000
        }
    },
    transformation: {
        request: {
            enabled: process.env.REQUEST_TRANSFORM_ENABLED === 'true',
            headers: process.env.REQUEST_TRANSFORM_HEADERS === 'true',
            query: process.env.REQUEST_TRANSFORM_QUERY === 'true',
            body: process.env.REQUEST_TRANSFORM_BODY === 'true'
        },
        response: {
            enabled: process.env.RESPONSE_TRANSFORM_ENABLED === 'true',
            headers: process.env.RESPONSE_TRANSFORM_HEADERS === 'true',
            body: process.env.RESPONSE_TRANSFORM_BODY === 'true'
        }
    }
}));
//# sourceMappingURL=gateway.config.js.map