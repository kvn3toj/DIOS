"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const security_service_1 = require("../services/security.service");
const security_audit_service_1 = require("../services/security-audit.service");
let SecurityGuard = class SecurityGuard {
    constructor(reflector, securityService, securityAuditService) {
        this.reflector = reflector;
        this.securityService = securityService;
        this.securityAuditService = securityAuditService;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const securityLevel = this.reflector.get('securityLevel', context.getHandler());
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
    async getActivePolicy() {
        return this.securityService['getActivePolicy']();
    }
    async getRequestCount(key, minute) {
        return 0;
    }
};
exports.SecurityGuard = SecurityGuard;
exports.SecurityGuard = SecurityGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        security_service_1.SecurityService,
        security_audit_service_1.SecurityAuditService])
], SecurityGuard);
//# sourceMappingURL=security.guard.js.map