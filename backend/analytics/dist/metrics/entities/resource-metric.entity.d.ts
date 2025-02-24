export declare enum ResourceType {
    DATABASE = "DATABASE",
    CACHE = "CACHE",
    QUEUE = "QUEUE",
    STORAGE = "STORAGE",
    API = "API"
}
export declare enum ResourceMetricType {
    UTILIZATION = "UTILIZATION",
    AVAILABILITY = "AVAILABILITY",
    SATURATION = "SATURATION",
    ERRORS = "ERRORS",
    LATENCY = "LATENCY"
}
export declare class ResourceMetricEntity {
    id: string;
    resourceType: ResourceType;
    metricType: ResourceMetricType;
    resourceName: string;
    region?: string;
    value: number;
    metadata: {
        unit: string;
        capacity?: number;
        threshold?: number;
        critical?: number;
        description?: string;
    };
    status?: {
        health: 'healthy' | 'degraded' | 'critical';
        message?: string;
        lastCheck: Date;
    };
    alerts?: {
        triggered: boolean;
        level: 'warning' | 'error' | 'critical';
        message: string;
        timestamp: Date;
    }[];
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}
