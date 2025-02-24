import { AuditLogService, AuditEventType } from '../services/audit-log.service';
export declare class AuditLogController {
    private readonly auditLogService;
    private readonly logger;
    constructor(auditLogService: AuditLogService);
    getAuditLogs(userId?: string, eventType?: AuditEventType, status?: 'success' | 'failure', startDate?: string, endDate?: string, limit?: number, offset?: number): Promise<{
        success: boolean;
        data: {
            total: any;
            logs: any;
        };
    }>;
    getSecurityAlerts(startDate?: string, endDate?: string, severity?: 'low' | 'medium' | 'high', limit?: number, offset?: number): Promise<{
        success: boolean;
        data: {
            total: any;
            alerts: any;
        };
    }>;
}
