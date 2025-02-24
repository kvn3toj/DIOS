import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
interface PerformanceMetrics {
    response: {
        p50: number;
        p95: number;
        p99: number;
    };
    availability: {
        uptime: number;
        reliability: number;
    };
    resources: {
        cpu: number;
        memory: number;
    };
}
interface QualityMetrics {
    errors: {
        rate: number;
        distribution: Record<string, number>;
    };
    testing: {
        coverage: number;
        success: number;
    };
}
interface EngagementMetrics {
    users: {
        active: {
            daily: number;
            weekly: number;
            monthly: number;
        };
        retention: {
            d1: number;
            d7: number;
            d30: number;
        };
    };
}
interface MonetizationMetrics {
    revenue: {
        daily: number;
        arpu: number;
        ltv: number;
    };
    conversion: {
        rate: number;
        value: number;
    };
}
export declare class MetricsService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    collectPerformanceMetrics(): Promise<PerformanceMetrics>;
    collectQualityMetrics(): Promise<QualityMetrics>;
    collectEngagementMetrics(): Promise<EngagementMetrics>;
    collectMonetizationMetrics(): Promise<MonetizationMetrics>;
    checkAlertThresholds(metrics: any): Promise<void>;
    private getMetricValue;
    private isThresholdExceeded;
    private triggerAlert;
}
export {};
