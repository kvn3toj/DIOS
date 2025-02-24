export declare class NetworkMetric {
    id: string;
    timestamp: Date;
    bytesIn: number;
    bytesOut: number;
    packetsIn: number;
    packetsOut: number;
    errors: number;
    dropped: number;
    avgLatency: number;
    maxLatency: number;
    minLatency: number;
    jitter: number;
    packetLoss: number;
    connectionStatus: string;
    activeConnections: number;
    connectionErrors: number;
    utilization: number;
    saturation: number;
    bandwidth: {
        incoming: number;
        outgoing: number;
    };
    metadata?: Record<string, any>;
}
