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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityAuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const security_policy_entity_1 = require("../entities/security-policy.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
let SecurityAuditService = class SecurityAuditService {
    constructor(securityPolicyRepository, eventEmitter) {
        this.securityPolicyRepository = securityPolicyRepository;
        this.eventEmitter = eventEmitter;
    }
    async logSecurityEvent(event) {
        this.eventEmitter.emit('security.audit', event);
        const policy = await this.getActivePolicy();
        if (this.isSensitiveAction(event, policy)) {
            await this.handleSensitiveAction(event, policy);
        }
        if (event.action === 'login' && event.status === 'failure') {
            await this.trackFailedLogin(event, policy);
        }
        if (this.isSuspiciousActivity(event)) {
            await this.trackSuspiciousActivity(event, policy);
        }
    }
    async handleSensitiveAction(event, policy) {
        if (policy.auditPolicy.sensitiveActions.includes(event.action)) {
            this.eventEmitter.emit('security.sensitive-action', {
                ...event,
                policyName: policy.name,
                level: policy.level
            });
            await this.logDetailedAudit(event, policy);
        }
    }
    async trackFailedLogin(event, policy) {
        const recentFailures = await this.getRecentFailedLogins(event.userId);
        if (recentFailures.length >= policy.auditPolicy.alertThresholds.failedLogins) {
            this.eventEmitter.emit('security.brute-force-attempt', {
                userId: event.userId,
                attempts: recentFailures.length,
                ip: event.ip,
                timestamp: event.timestamp
            });
            await this.protectAccount(event.userId);
        }
    }
    async trackSuspiciousActivity(event, policy) {
        const recentSuspicious = await this.getRecentSuspiciousActivities(event.userId);
        if (recentSuspicious.length >= policy.auditPolicy.alertThresholds.suspiciousActivities) {
            this.eventEmitter.emit('security.suspicious-activity', {
                userId: event.userId,
                activities: recentSuspicious,
                ip: event.ip,
                timestamp: event.timestamp
            });
            await this.enhanceSecurityMeasures(event.userId);
        }
    }
    async getRecentFailedLogins(userId) {
        return [];
    }
    async getRecentSuspiciousActivities(userId) {
        return [];
    }
    async protectAccount(userId) {
        this.eventEmitter.emit('security.account-protected', {
            userId,
            timestamp: new Date(),
            action: 'account-protection'
        });
    }
    async enhanceSecurityMeasures(userId) {
        this.eventEmitter.emit('security.enhanced-security', {
            userId,
            timestamp: new Date(),
            action: 'security-enhancement'
        });
    }
    async logDetailedAudit(event, policy) {
        this.eventEmitter.emit('security.detailed-audit', {
            ...event,
            policyName: policy.name,
            level: policy.level,
            timestamp: new Date()
        });
    }
    isSuspiciousActivity(event) {
        return false;
    }
    async getActivePolicy() {
        return this.securityPolicyRepository.findOne({
            where: { name: 'default', isActive: true }
        });
    }
    isSensitiveAction(event, policy) {
        return policy.auditPolicy.sensitiveActions.includes(event.action);
    }
};
exports.SecurityAuditService = SecurityAuditService;
exports.SecurityAuditService = SecurityAuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(security_policy_entity_1.SecurityPolicy)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _a : Object])
], SecurityAuditService);
//# sourceMappingURL=security-audit.service.js.map