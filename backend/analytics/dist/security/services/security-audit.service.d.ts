import { Repository } from 'typeorm';
import { SecurityPolicy } from '../entities/security-policy.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface SecurityEvent {
    type: string;
    userId?: string;
    resourceId?: string;
    action: string;
    status: 'success' | 'failure';
    details: any;
    ip?: string;
    userAgent?: string;
    timestamp: Date;
}
export declare class SecurityAuditService {
    private securityPolicyRepository;
    private eventEmitter;
    constructor(securityPolicyRepository: Repository<SecurityPolicy>, eventEmitter: EventEmitter2);
    logSecurityEvent(event: SecurityEvent): Promise<void>;
    private handleSensitiveAction;
    private trackFailedLogin;
    private trackSuspiciousActivity;
    private getRecentFailedLogins;
    private getRecentSuspiciousActivities;
    private protectAccount;
    private enhanceSecurityMeasures;
    private logDetailedAudit;
    private isSuspiciousActivity;
    private getActivePolicy;
    private isSensitiveAction;
}
