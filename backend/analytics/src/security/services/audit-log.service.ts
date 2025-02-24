import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

export enum AuditEventType {
  // Auth events
  LOGIN_SUCCESS = 'auth.login.success',
  LOGIN_FAILURE = 'auth.login.failure',
  LOGOUT = 'auth.logout',
  PASSWORD_CHANGE = 'auth.password.change',
  PASSWORD_RESET = 'auth.password.reset',
  MFA_SETUP = 'auth.mfa.setup',
  MFA_VERIFY = 'auth.mfa.verify',
  MFA_DISABLE = 'auth.mfa.disable',
  
  // Access events
  RESOURCE_ACCESS = 'access.resource',
  PERMISSION_GRANT = 'access.permission.grant',
  PERMISSION_REVOKE = 'access.permission.revoke',
  ROLE_ASSIGN = 'access.role.assign',
  ROLE_REVOKE = 'access.role.revoke',
  
  // Security events
  SUSPICIOUS_ACTIVITY = 'security.suspicious',
  BRUTE_FORCE_ATTEMPT = 'security.brute_force',
  INVALID_TOKEN = 'security.invalid_token',
  RATE_LIMIT_EXCEEDED = 'security.rate_limit',
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

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    // Subscribe to relevant events
    this.subscribeToEvents();
  }

  private subscribeToEvents() {
    // Auth events
    this.eventEmitter.on('auth.*', this.handleAuthEvent.bind(this));
    
    // Access events
    this.eventEmitter.on('access.*', this.handleAccessEvent.bind(this));
    
    // Security events
    this.eventEmitter.on('security.*', this.handleSecurityEvent.bind(this));
  }

  async logAuditEvent(entry: AuditLogEntry) {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: entry.userId,
          eventType: entry.eventType,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          action: entry.action,
          status: entry.status,
          details: entry.details,
          ip: entry.ip,
          userAgent: entry.userAgent,
          timestamp: entry.timestamp,
        },
      });

      // Emit event for real-time monitoring
      this.eventEmitter.emit('audit.log.created', entry);

      // Log security alerts
      if (entry.status === 'failure' || entry.eventType.startsWith('security.')) {
        this.logger.warn(`Security Alert: ${entry.eventType}`, {
          ...entry,
          timestamp: entry.timestamp.toISOString(),
        });
      }
    } catch (error) {
      this.logger.error('Failed to create audit log entry:', error);
      throw error;
    }
  }

  private async handleAuthEvent(event: string, payload: any) {
    try {
      const entry: AuditLogEntry = {
        eventType: event as AuditEventType,
        userId: payload.userId,
        status: payload.success ? 'success' : 'failure',
        details: payload,
        ip: payload.ip,
        userAgent: payload.userAgent,
        timestamp: new Date(),
      };

      await this.logAuditEvent(entry);
    } catch (error) {
      this.logger.error('Failed to handle auth event:', error);
    }
  }

  private async handleAccessEvent(event: string, payload: any) {
    try {
      const entry: AuditLogEntry = {
        eventType: event as AuditEventType,
        userId: payload.userId,
        resourceType: payload.resourceType,
        resourceId: payload.resourceId,
        action: payload.action,
        status: payload.success ? 'success' : 'failure',
        details: payload,
        ip: payload.ip,
        userAgent: payload.userAgent,
        timestamp: new Date(),
      };

      await this.logAuditEvent(entry);
    } catch (error) {
      this.logger.error('Failed to handle access event:', error);
    }
  }

  private async handleSecurityEvent(event: string, payload: any) {
    try {
      const entry: AuditLogEntry = {
        eventType: event as AuditEventType,
        userId: payload.userId,
        status: 'failure',
        details: payload,
        ip: payload.ip,
        userAgent: payload.userAgent,
        timestamp: new Date(),
      };

      await this.logAuditEvent(entry);
    } catch (error) {
      this.logger.error('Failed to handle security event:', error);
    }
  }

  async getAuditLogs(filters: {
    userId?: string;
    eventType?: AuditEventType;
    status?: 'success' | 'failure';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {};

      if (filters.userId) where.userId = filters.userId;
      if (filters.eventType) where.eventType = filters.eventType;
      if (filters.status) where.status = filters.status;
      if (filters.startDate || filters.endDate) {
        where.timestamp = {};
        if (filters.startDate) where.timestamp.gte = filters.startDate;
        if (filters.endDate) where.timestamp.lte = filters.endDate;
      }

      const [total, logs] = await Promise.all([
        this.prisma.auditLog.count({ where }),
        this.prisma.auditLog.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: filters.limit || 50,
          skip: filters.offset || 0,
        }),
      ]);

      return {
        total,
        logs,
      };
    } catch (error) {
      this.logger.error('Failed to get audit logs:', error);
      throw error;
    }
  }

  async getSecurityAlerts(options: {
    startDate?: Date;
    endDate?: Date;
    severity?: 'low' | 'medium' | 'high';
    limit?: number;
    offset?: number;
  }) {
    try {
      const where: any = {
        OR: [
          { status: 'failure' },
          { eventType: { startsWith: 'security.' } },
        ],
      };

      if (options.startDate || options.endDate) {
        where.timestamp = {};
        if (options.startDate) where.timestamp.gte = options.startDate;
        if (options.endDate) where.timestamp.lte = options.endDate;
      }

      const [total, alerts] = await Promise.all([
        this.prisma.auditLog.count({ where }),
        this.prisma.auditLog.findMany({
          where,
          orderBy: { timestamp: 'desc' },
          take: options.limit || 50,
          skip: options.offset || 0,
        }),
      ]);

      return {
        total,
        alerts: alerts.map(alert => ({
          ...alert,
          severity: this.calculateAlertSeverity(alert),
        })),
      };
    } catch (error) {
      this.logger.error('Failed to get security alerts:', error);
      throw error;
    }
  }

  private calculateAlertSeverity(alert: any): 'low' | 'medium' | 'high' {
    // Implement severity calculation logic based on event type and details
    if (alert.eventType === AuditEventType.BRUTE_FORCE_ATTEMPT) {
      return 'high';
    }
    if (alert.eventType === AuditEventType.SUSPICIOUS_ACTIVITY) {
      return 'medium';
    }
    if (alert.eventType === AuditEventType.RATE_LIMIT_EXCEEDED) {
      return 'low';
    }
    return 'low';
  }
} 