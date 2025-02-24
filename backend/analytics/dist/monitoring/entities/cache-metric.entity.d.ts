export declare class CacheMetric {
    id: string;
    timestamp: Date;
    redis: {
        hitRate: number;
        missRate: number;
        memoryUsage: number;
        evictionCount: number;
        connectedClients: number;
        commandsProcessed: number;
        keyspaceHits: number;
        keyspaceMisses: number;
        latency: number;
    };
    memcached: {
        hitRate: number;
        missRate: number;
        memoryUsage: number;
        evictionCount: number;
        currentConnections: number;
        totalItems: number;
        getHits: number;
        getMisses: number;
        latency: number;
    };
    application: {
        routeCache: {
            hitRate: number;
            size: number;
            entries: number;
        };
        dataCache: {
            hitRate: number;
            size: number;
            entries: number;
        };
        queryCache: {
            hitRate: number;
            size: number;
            entries: number;
        };
    };
    metadata?: Record<string, any>;
}
