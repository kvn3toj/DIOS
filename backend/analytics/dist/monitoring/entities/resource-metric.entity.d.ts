export declare class ResourceMetric {
    id: string;
    timestamp: Date;
    cpuUsage: number;
    memoryUsed: number;
    memoryTotal: number;
    memoryPercentage: number;
    diskUsed: number;
    diskTotal: number;
    diskPercentage: number;
    networkBytesIn: number;
    networkBytesOut: number;
    metadata?: Record<string, any>;
}
