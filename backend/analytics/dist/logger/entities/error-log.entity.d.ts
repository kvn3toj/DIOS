export declare class ErrorLog {
    id: string;
    timestamp: Date;
    name: string;
    message: string;
    stack?: string;
    context: string;
    metadata: Record<string, any>;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'new' | 'investigating' | 'resolved' | 'ignored';
    tags: string[];
    resolvedAt?: Date;
    resolvedBy?: string;
    resolution?: string;
}
