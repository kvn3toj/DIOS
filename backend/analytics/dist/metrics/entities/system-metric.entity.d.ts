export declare enum SystemMetricType {
    CPU = "CPU",
    MEMORY = "MEMORY",
    DISK = "DISK",
    NETWORK = "NETWORK",
    PROCESS = "PROCESS"
}
export declare class SystemMetricEntity {
    id: string;
    type: SystemMetricType;
    service: string;
    instance: string;
    value: number;
    metadata: {
        unit: string;
        min?: number;
        max?: number;
        threshold?: number;
        description?: string;
    };
    tags?: Record<string, string>;
    timestamp: Date;
    createdAt: Date;
    updatedAt: Date;
}
