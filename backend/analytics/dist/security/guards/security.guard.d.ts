import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SecurityService } from '../services/security.service';
import { SecurityAuditService } from '../services/security-audit.service';
export declare class SecurityGuard implements CanActivate {
    private reflector;
    private securityService;
    private securityAuditService;
    constructor(reflector: Reflector, securityService: SecurityService, securityAuditService: SecurityAuditService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private getActivePolicy;
    private getRequestCount;
}
