import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

@Injectable()
export class SecurityAuditService {
  constructor(
    @InjectRepository(SecurityPolicy)
    private securityPolicyRepository: Repository<SecurityPolicy>,
    private eventEmitter: EventEmitter2
  ) {}

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // Emit event for real-time monitoring
    this.eventEmitter.emit('security.audit', event);

    // Check if this is a sensitive action that requires immediate attention
    const policy = await this.getActivePolicy();
    if (this.isSensitiveAction(event, policy)) {
      await this.handleSensitiveAction(event, policy);
    }

    // Track failed login attempts
    if (event.action === 'login' && event.status === 'failure') {
      await this.trackFailedLogin(event, policy);
    }

    // Track suspicious activities
    if (this.isSuspiciousActivity(event)) {
      await this.trackSuspiciousActivity(event, policy);
    }
  }

  private async handleSensitiveAction(event: SecurityEvent, policy: SecurityPolicy): Promise<void> {
    if (policy.auditPolicy.sensitiveActions.includes(event.action)) {
      // Emit alert for sensitive action
      this.eventEmitter.emit('security.sensitive-action', {
        ...event,
        policyName: policy.name,
        level: policy.level
      });

      // Log detailed audit trail
      await this.logDetailedAudit(event, policy);
    }
  }

  private async trackFailedLogin(event: SecurityEvent, policy: SecurityPolicy): Promise<void> {
    const recentFailures = await this.getRecentFailedLogins(event.userId);
    
    if (recentFailures.length >= policy.auditPolicy.alertThresholds.failedLogins) {
      this.eventEmitter.emit('security.brute-force-attempt', {
        userId: event.userId,
        attempts: recentFailures.length,
        ip: event.ip,
        timestamp: event.timestamp
      });

      // Implement account protection measures
      await this.protectAccount(event.userId);
    }
  }

  private async trackSuspiciousActivity(event: SecurityEvent, policy: SecurityPolicy): Promise<void> {
    const recentSuspicious = await this.getRecentSuspiciousActivities(event.userId);
    
    if (recentSuspicious.length >= policy.auditPolicy.alertThresholds.suspiciousActivities) {
      this.eventEmitter.emit('security.suspicious-activity', {
        userId: event.userId,
        activities: recentSuspicious,
        ip: event.ip,
        timestamp: event.timestamp
      });

      // Implement additional security measures
      await this.enhanceSecurityMeasures(event.userId);
    }
  }

  private async getRecentFailedLogins(userId: string): Promise<SecurityEvent[]> {
    // This would typically query your audit log storage
    // Simplified implementation for example
    return [];
  }

  private async getRecentSuspiciousActivities(userId: string): Promise<SecurityEvent[]> {
    // This would typically query your audit log storage
    // Simplified implementation for example
    return [];
  }

  private async protectAccount(userId: string): Promise<void> {
    // Implement account protection measures like:
    // - Temporary lockout
    // - Require additional verification
    // - Notify user of suspicious activity
    this.eventEmitter.emit('security.account-protected', {
      userId,
      timestamp: new Date(),
      action: 'account-protection'
    });
  }

  private async enhanceSecurityMeasures(userId: string): Promise<void> {
    // Implement enhanced security measures like:
    // - Require MFA for next login
    // - Lower thresholds for suspicious activity
    // - Increase monitoring
    this.eventEmitter.emit('security.enhanced-security', {
      userId,
      timestamp: new Date(),
      action: 'security-enhancement'
    });
  }

  private async logDetailedAudit(event: SecurityEvent, policy: SecurityPolicy): Promise<void> {
    // This would typically write to a secure audit log storage
    // Simplified implementation for example
    this.eventEmitter.emit('security.detailed-audit', {
      ...event,
      policyName: policy.name,
      level: policy.level,
      timestamp: new Date()
    });
  }

  private isSuspiciousActivity(event: SecurityEvent): boolean {
    // Implement logic to detect suspicious activities like:
    // - Unusual login times
    // - Multiple failed actions
    // - Unusual IP addresses
    // - Rapid successive actions
    return false; // Simplified implementation
  }

  private async getActivePolicy(): Promise<SecurityPolicy> {
    return this.securityPolicyRepository.findOne({
      where: { name: 'default', isActive: true }
    });
  }

  private isSensitiveAction(event: SecurityEvent, policy: SecurityPolicy): boolean {
    return policy.auditPolicy.sensitiveActions.includes(event.action);
  }
} 