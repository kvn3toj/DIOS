import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
export declare enum AuditEventType {
    LOGIN_SUCCESS = "auth.login.success",
    LOGIN_FAILURE = "auth.login.failure",
    LOGOUT = "auth.logout",
    PASSWORD_CHANGE = "auth.password.change",
    PASSWORD_RESET = "auth.password.reset",
    MFA_SETUP = "auth.mfa.setup",
    MFA_VERIFY = "auth.mfa.verify",
    MFA_DISABLE = "auth.mfa.disable",
    RESOURCE_ACCESS = "access.resource",
    PERMISSION_GRANT = "access.permission.grant",
    PERMISSION_REVOKE = "access.permission.revoke",
    ROLE_ASSIGN = "access.role.assign",
    ROLE_REVOKE = "access.role.revoke",
    SUSPICIOUS_ACTIVITY = "security.suspicious",
    BRUTE_FORCE_ATTEMPT = "security.brute_force",
    INVALID_TOKEN = "security.invalid_token",
    RATE_LIMIT_EXCEEDED = "security.rate_limit"
}
export interface AuditLogEntry {
    userId?: string;
    eventType: AuditEventType;
    resourceType?: string;
    resourceId?: string;
    action?: string;
    status: 'success' | 'failure';
    details?: Record<string, any>;
    ip?: string;
    userAgent?: string;
    timestamp: Date;
}
export declare class AuditLogService {
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    constructor(prisma: PrismaService, eventEmitter: EventEmitter2);
    private subscribeToEvents;
    logAuditEvent(entry: AuditLogEntry): Promise<void>;
    private handleAuthEvent;
    private handleAccessEvent;
    private handleSecurityEvent;
    getAuditLogs(filters: {
        userId?: string;
        eventType?: AuditEventType;
        status?: 'success' | 'failure';
        startDate?: Date;
        endDate?: Date;
        limit?: number;
        offset?: number;
    }): Promise<{
        total: any;
        logs: any;
    }>;
    getSecurityAlerts(options: {
        startDate?: Date;
        endDate?: Date;
        severity?: 'low' | 'medium' | 'high';
        limit?: number;
        offset?: number;
    }): Promise<{
        total: any;
        alerts: any;
    }>;
    private calculateAlertSeverity;
}
