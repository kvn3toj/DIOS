import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SecurityService } from '../services/security.service';
import { SecurityAuditService } from '../services/security-audit.service';
import { Observable } from 'rxjs';

@Injectable()
export class SecurityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private securityService: SecurityService,
    private securityAuditService: SecurityAuditService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const securityLevel = this.reflector.get<string>('securityLevel', context.getHandler());
    
    // Log security event
    await this.securityAuditService.logSecurityEvent({
      type: 'access-control',
      userId: request.user?.id,
      action: `${request.method} ${request.path}`,
      status: 'pending',
      details: {
        securityLevel,
        method: request.method,
        path: request.path,
        query: request.query,
        body: request.body
      },
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: new Date()
    });

    // Validate session if exists
    if (request.session) {
      const isValidSession = await this.securityService.validateSession(request.session);
      if (!isValidSession) {
        await this.securityAuditService.logSecurityEvent({
          type: 'session-validation',
          userId: request.user?.id,
          action: 'session-check',
          status: 'failure',
          details: {
            reason: 'Invalid or expired session'
          },
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          timestamp: new Date()
        });
        return false;
      }
    }

    // Validate MFA if required
    if (request.user && request.user.mfaEnabled) {
      const isValidMfa = await this.securityService.validateMfaSetup(request.user.mfa);
      if (!isValidMfa) {
        await this.securityAuditService.logSecurityEvent({
          type: 'mfa-validation',
          userId: request.user.id,
          action: 'mfa-check',
          status: 'failure',
          details: {
            reason: 'Invalid or expired MFA setup'
          },
          ip: request.ip,
          userAgent: request.headers['user-agent'],
          timestamp: new Date()
        });
        return false;
      }
    }

    // Check rate limits
    const policy = await this.getActivePolicy();
    const key = `${request.ip}-${request.path}`;
    const currentMinute = Math.floor(Date.now() / 60000);
    const requestCount = await this.getRequestCount(key, currentMinute);

    if (requestCount > policy.rateLimit.apiRequestsPerMinute) {
      await this.securityAuditService.logSecurityEvent({
        type: 'rate-limit',
        userId: request.user?.id,
        action: 'rate-check',
        status: 'failure',
        details: {
          reason: 'Rate limit exceeded',
          count: requestCount,
          limit: policy.rateLimit.apiRequestsPerMinute
        },
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        timestamp: new Date()
      });
      return false;
    }

    // Log successful access
    await this.securityAuditService.logSecurityEvent({
      type: 'access-control',
      userId: request.user?.id,
      action: `${request.method} ${request.path}`,
      status: 'success',
      details: {
        securityLevel,
        method: request.method,
        path: request.path
      },
      ip: request.ip,
      userAgent: request.headers['user-agent'],
      timestamp: new Date()
    });

    return true;
  }

  private async getActivePolicy() {
    // This would typically be cached
    return this.securityService['getActivePolicy']();
  }

  private async getRequestCount(key: string, minute: number): Promise<number> {
    // This would typically use Redis or a similar store
    // Simplified implementation for example
    return 0;
  }
} 