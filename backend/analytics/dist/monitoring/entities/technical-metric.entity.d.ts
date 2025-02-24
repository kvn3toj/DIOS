export declare class TechnicalMetric {
    id: string;
    timestamp: Date;
    performance: {
        responseTime: {
            p50: number;
            p95: number;
            p99: number;
        };
    };
    availability: {
        uptime: number;
        reliability: number;
    };
    resources: {
        cpu: {
            usage: number;
            average: number;
        };
        memory: {
            usage: number;
            average: number;
        };
    };
    errors: {
        rate: number;
        distribution: Record<string, number>;
    };
    metadata?: Record<string, any>;
}
