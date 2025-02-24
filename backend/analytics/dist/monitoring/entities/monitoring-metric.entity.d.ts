export declare class MonitoringMetric {
    id: number;
    timestamp: Date;
    cpu: {
        usage: number;
        cores: number;
        loadAverage: number[];
    };
    memory: {
        total: number;
        free: number;
        used: number;
        usagePercentage: number;
    };
    process: {
        uptime: number;
        pid: number;
        memory: {
            heapTotal: number;
            heapUsed: number;
            rss: number;
            external: number;
        };
        cpuUsage: {
            user: number;
            system: number;
        };
    };
    system: {
        platform: string;
        arch: string;
        version: string;
        uptime: number;
        hostname: string;
        networkInterfaces: any;
    };
    status: 'healthy' | 'warning' | 'critical';
    alerts?: Array<{
        type: string;
        severity: string;
        message: string;
        timestamp: Date;
    }>;
    type: 'metric' | 'alert';
}
