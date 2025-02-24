import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NetworkMetric } from '../entities/network-metric.entity';
export declare class NetworkMonitoringService {
    private readonly networkMetricRepository;
    private readonly eventEmitter;
    private readonly logger;
    private readonly updateInterval;
    private readonly thresholds;
    constructor(networkMetricRepository: Repository<NetworkMetric>, eventEmitter: EventEmitter2);
    private startNetworkMonitoring;
    collectMetrics(): Promise<{
        bandwidth: {
            incoming: number;
            outgoing: number;
        };
        utilization: number;
        saturation: number;
        packetLoss: number;
        connectionStatus: string;
        activeConnections: number;
        connectionErrors: number;
        avgLatency: number;
        maxLatency: number;
        minLatency: number;
        jitter: number;
        bytesIn: number;
        bytesOut: number;
        packetsIn: number;
        packetsOut: number;
        errors: number;
        dropped: number;
        timestamp: Date;
    }>;
    private gatherNetworkMetrics;
    private getNetworkStats;
    private getLatencyStats;
    private getConnectivityStats;
    private getThroughputStats;
    private saveMetrics;
    private checkThresholds;
    getNetworkMetrics(timeRange?: {
        start: Date;
        end: Date;
    }): Promise<NetworkMetric[]>;
    getNetworkAnalytics(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        latency: {
            average: number;
            max: number;
            min: number;
            trend: "increasing" | "decreasing" | "stable";
        };
        packetLoss: {
            average: number;
            trend: "increasing" | "decreasing" | "stable";
        };
        bandwidth: {
            averageUtilization: number;
            peakUtilization: number;
            trend: "increasing" | "decreasing" | "stable";
        };
        errors: {
            total: number;
            trend: "increasing" | "decreasing" | "stable";
        };
    }>;
    private calculateAverage;
    private calculateTrend;
}
