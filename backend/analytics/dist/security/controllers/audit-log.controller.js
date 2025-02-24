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
var AuditLogController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
const audit_log_service_1 = require("../services/audit-log.service");
let AuditLogController = AuditLogController_1 = class AuditLogController {
    constructor(auditLogService) {
        this.auditLogService = auditLogService;
        this.logger = new common_1.Logger(AuditLogController_1.name);
    }
    async getAuditLogs(userId, eventType, status, startDate, endDate, limit = 50, offset = 0) {
        try {
            const filters = {
                userId,
                eventType,
                status,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                limit,
                offset,
            };
            const result = await this.auditLogService.getAuditLogs(filters);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to get audit logs:', error);
            throw error;
        }
    }
    async getSecurityAlerts(startDate, endDate, severity, limit = 50, offset = 0) {
        try {
            const options = {
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                severity,
                limit,
                offset,
            };
            const result = await this.auditLogService.getSecurityAlerts(options);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            this.logger.error('Failed to get security alerts:', error);
            throw error;
        }
    }
};
exports.AuditLogController = AuditLogController;
__decorate([
    (0, common_1.Get)('logs'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'audit_logs', action: 'read' }),
    __param(0, (0, common_1.Query)('userId')),
    __param(1, (0, common_1.Query)('eventType')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __param(6, (0, common_1.Query)('offset', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('alerts'),
    (0, require_permission_decorator_1.RequirePermission)({ resource: 'security_alerts', action: 'read' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __param(2, (0, common_1.Query)('severity')),
    __param(3, (0, common_1.Query)('limit', common_1.ParseIntPipe)),
    __param(4, (0, common_1.Query)('offset', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object, Object]),
    __metadata("design:returntype", Promise)
], AuditLogController.prototype, "getSecurityAlerts", null);
exports.AuditLogController = AuditLogController = AuditLogController_1 = __decorate([
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [audit_log_service_1.AuditLogService])
], AuditLogController);
//# sourceMappingURL=audit-log.controller.js.map