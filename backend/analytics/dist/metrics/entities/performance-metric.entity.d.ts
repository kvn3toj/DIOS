export declare enum PerformanceMetricType {
    RESPONSE_TIME = "RESPONSE_TIME",
    THROUGHPUT = "THROUGHPUT",
    ERROR_RATE = "ERROR_RATE",
    LATENCY = "LATENCY",
    CONCURRENT_USERS = "CONCURRENT_USERS",
    RESOURCE_USAGE = "RESOURCE_USAGE"
}
export declare class PerformanceMetricEntity {
    id: string;
    type: PerformanceMetricType;
    endpoint: string;
    method: string;
    value: number;
    count?: number;
    percentile95?: number;
    percentile99?: number;
    metadata: {
        unit: string;
        threshold?: number;
        sla?: number;
        description?: string;
    };
    breakdown?: {
        database?: number;
        external?: number;
        processing?: number;
        network?: number;
    };
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
    statusCode: number;
    requestSize: number;
    responseSize: number;
    duration: number;
    cpuUsage: number;
    memoryUsage: number;
    concurrentRequests: number;
    isError: boolean;
    errorMessage: string;
    tags: Record<string, string>;
    environment: string;
    version: string;
    region: string;
    userId: string;
    sessionId: string;
    requestId: string;
}
