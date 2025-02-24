export declare class DatabaseMetric {
    id: string;
    timestamp: Date;
    activeConnections: number;
    idleConnections: number;
    maxConnections: number;
    connectionUtilization: number;
    waitingQueries: number;
    avgQueryTime: number;
    slowQueries: number;
    deadlocks: number;
    rollbacks: number;
    transactions: {
        active: number;
        committed: number;
        rolledBack: number;
    };
    cacheHitRatio: number;
    indexHitRatio: number;
    bufferCacheHitRatio: number;
    sharedBufferUsage: number;
    tableStats: {
        totalRows: number;
        totalSize: number;
        indexSize: number;
        scanTypes: {
            seqScans: number;
            indexScans: number;
        };
    };
    vacuumStats: {
        lastAutoVacuum: Date;
        autoVacuumCount: number;
    };
    metadata?: Record<string, any>;
}
