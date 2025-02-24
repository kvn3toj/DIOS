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
var AuditLogService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogService = exports.AuditEventType = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
var AuditEventType;
(function (AuditEventType) {
    AuditEventType["LOGIN_SUCCESS"] = "auth.login.success";
    AuditEventType["LOGIN_FAILURE"] = "auth.login.failure";
    AuditEventType["LOGOUT"] = "auth.logout";
    AuditEventType["PASSWORD_CHANGE"] = "auth.password.change";
    AuditEventType["PASSWORD_RESET"] = "auth.password.reset";
    AuditEventType["MFA_SETUP"] = "auth.mfa.setup";
    AuditEventType["MFA_VERIFY"] = "auth.mfa.verify";
    AuditEventType["MFA_DISABLE"] = "auth.mfa.disable";
    AuditEventType["RESOURCE_ACCESS"] = "access.resource";
    AuditEventType["PERMISSION_GRANT"] = "access.permission.grant";
    AuditEventType["PERMISSION_REVOKE"] = "access.permission.revoke";
    AuditEventType["ROLE_ASSIGN"] = "access.role.assign";
    AuditEventType["ROLE_REVOKE"] = "access.role.revoke";
    AuditEventType["SUSPICIOUS_ACTIVITY"] = "security.suspicious";
    AuditEventType["BRUTE_FORCE_ATTEMPT"] = "security.brute_force";
    AuditEventType["INVALID_TOKEN"] = "security.invalid_token";
    AuditEventType["RATE_LIMIT_EXCEEDED"] = "security.rate_limit";
})(AuditEventType || (exports.AuditEventType = AuditEventType = {}));
let AuditLogService = AuditLogService_1 = class AuditLogService {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(AuditLogService_1.name);
        this.subscribeToEvents();
    }
    subscribeToEvents() {
        this.eventEmitter.on('auth.*', this.handleAuthEvent.bind(this));
        this.eventEmitter.on('access.*', this.handleAccessEvent.bind(this));
        this.eventEmitter.on('security.*', this.handleSecurityEvent.bind(this));
    }
    async logAuditEvent(entry) {
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
            this.eventEmitter.emit('audit.log.created', entry);
            if (entry.status === 'failure' || entry.eventType.startsWith('security.')) {
                this.logger.warn(`Security Alert: ${entry.eventType}`, {
                    ...entry,
                    timestamp: entry.timestamp.toISOString(),
                });
            }
        }
        catch (error) {
            this.logger.error('Failed to create audit log entry:', error);
            throw error;
        }
    }
    async handleAuthEvent(event, payload) {
        try {
            const entry = {
                eventType: event,
                userId: payload.userId,
                status: payload.success ? 'success' : 'failure',
                details: payload,
                ip: payload.ip,
                userAgent: payload.userAgent,
                timestamp: new Date(),
            };
            await this.logAuditEvent(entry);
        }
        catch (error) {
            this.logger.error('Failed to handle auth event:', error);
        }
    }
    async handleAccessEvent(event, payload) {
        try {
            const entry = {
                eventType: event,
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
        }
        catch (error) {
            this.logger.error('Failed to handle access event:', error);
        }
    }
    async handleSecurityEvent(event, payload) {
        try {
            const entry = {
                eventType: event,
                userId: payload.userId,
                status: 'failure',
                details: payload,
                ip: payload.ip,
                userAgent: payload.userAgent,
                timestamp: new Date(),
            };
            await this.logAuditEvent(entry);
        }
        catch (error) {
            this.logger.error('Failed to handle security event:', error);
        }
    }
    async getAuditLogs(filters) {
        try {
            const where = {};
            if (filters.userId)
                where.userId = filters.userId;
            if (filters.eventType)
                where.eventType = filters.eventType;
            if (filters.status)
                where.status = filters.status;
            if (filters.startDate || filters.endDate) {
                where.timestamp = {};
                if (filters.startDate)
                    where.timestamp.gte = filters.startDate;
                if (filters.endDate)
                    where.timestamp.lte = filters.endDate;
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
        }
        catch (error) {
            this.logger.error('Failed to get audit logs:', error);
            throw error;
        }
    }
    async getSecurityAlerts(options) {
        try {
            const where = {
                OR: [
                    { status: 'failure' },
                    { eventType: { startsWith: 'security.' } },
                ],
            };
            if (options.startDate || options.endDate) {
                where.timestamp = {};
                if (options.startDate)
                    where.timestamp.gte = options.startDate;
                if (options.endDate)
                    where.timestamp.lte = options.endDate;
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
        }
        catch (error) {
            this.logger.error('Failed to get security alerts:', error);
            throw error;
        }
    }
    calculateAlertSeverity(alert) {
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
};
exports.AuditLogService = AuditLogService;
exports.AuditLogService = AuditLogService = AuditLogService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], AuditLogService);
//# sourceMappingURL=audit-log.service.js.map