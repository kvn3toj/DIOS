declare const _default: (() => {
    services: {
        gamification: {
            url: string;
            version: string;
            timeout: number;
        };
        social: {
            url: string;
            version: string;
            timeout: number;
        };
        analytics: {
            url: string;
            version: string;
            timeout: number;
        };
    };
    cache: {
        enabled: boolean;
        ttl: number;
        max: number;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    circuitBreaker: {
        failureThreshold: number;
        resetTimeout: number;
    };
    cors: {
        enabled: boolean;
        origin: string[];
        methods: string[];
        credentials: boolean;
    };
    security: {
        rateLimit: {
            enabled: boolean;
            windowMs: number;
            max: number;
        };
        helmet: {
            enabled: boolean;
            hidePoweredBy: boolean;
            noSniff: boolean;
            xssFilter: boolean;
        };
    };
    monitoring: {
        metrics: {
            enabled: boolean;
            interval: number;
        };
        healthCheck: {
            enabled: boolean;
            interval: number;
        };
    };
    discovery: {
        enabled: boolean;
        provider: string;
        refreshInterval: number;
    };
    loadBalancing: {
        enabled: boolean;
        strategy: string;
        healthCheck: {
            enabled: boolean;
            interval: number;
        };
    };
    transformation: {
        request: {
            enabled: boolean;
            headers: boolean;
            query: boolean;
            body: boolean;
        };
        response: {
            enabled: boolean;
            headers: boolean;
            body: boolean;
        };
    };
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    services: {
        gamification: {
            url: string;
            version: string;
            timeout: number;
        };
        social: {
            url: string;
            version: string;
            timeout: number;
        };
        analytics: {
            url: string;
            version: string;
            timeout: number;
        };
    };
    cache: {
        enabled: boolean;
        ttl: number;
        max: number;
    };
    rateLimit: {
        windowMs: number;
        max: number;
    };
    circuitBreaker: {
        failureThreshold: number;
        resetTimeout: number;
    };
    cors: {
        enabled: boolean;
        origin: string[];
        methods: string[];
        credentials: boolean;
    };
    security: {
        rateLimit: {
            enabled: boolean;
            windowMs: number;
            max: number;
        };
        helmet: {
            enabled: boolean;
            hidePoweredBy: boolean;
            noSniff: boolean;
            xssFilter: boolean;
        };
    };
    monitoring: {
        metrics: {
            enabled: boolean;
            interval: number;
        };
        healthCheck: {
            enabled: boolean;
            interval: number;
        };
    };
    discovery: {
        enabled: boolean;
        provider: string;
        refreshInterval: number;
    };
    loadBalancing: {
        enabled: boolean;
        strategy: string;
        healthCheck: {
            enabled: boolean;
            interval: number;
        };
    };
    transformation: {
        request: {
            enabled: boolean;
            headers: boolean;
            query: boolean;
            body: boolean;
        };
        response: {
            enabled: boolean;
            headers: boolean;
            body: boolean;
        };
    };
}>;
export default _default;
