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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const error_tracking_service_1 = require("./error-tracking.service");
let LoggerController = class LoggerController {
    constructor(errorTrackingService) {
        this.errorTrackingService = errorTrackingService;
    }
    async getErrors(start, end, context) {
        const timeRange = start && end ? {
            start: new Date(start),
            end: new Date(end),
        } : undefined;
        return this.errorTrackingService.getErrors(timeRange, context);
    }
    async getErrorAnalytics(start, end) {
        const timeRange = {
            start: new Date(start),
            end: new Date(end),
        };
        return this.errorTrackingService.getErrorAnalytics(timeRange);
    }
    async updateErrorStatus(id, updateData) {
        const errorLog = await this.errorTrackingService.getErrors(undefined, undefined);
        const error = errorLog.find(e => e.id === id);
        if (!error) {
            return { success: false, message: 'Error log not found' };
        }
        error.status = updateData.status;
        if (updateData.status === 'resolved') {
            error.resolvedAt = new Date();
            error.resolvedBy = updateData.resolvedBy;
            error.resolution = updateData.resolution;
        }
        await this.errorTrackingService['errorLogRepository'].save(error);
        return { success: true, error };
    }
};
exports.LoggerController = LoggerController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get error logs' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'context', required: false, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns error logs for the specified time range and context' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __param(2, (0, common_1.Query)('context')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LoggerController.prototype, "getErrors", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, swagger_1.ApiOperation)({ summary: 'Get error analytics' }),
    (0, swagger_1.ApiQuery)({ name: 'start', required: true, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'end', required: true, type: String }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Returns error analytics for the specified time range' }),
    __param(0, (0, common_1.Query)('start')),
    __param(1, (0, common_1.Query)('end')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LoggerController.prototype, "getErrorAnalytics", null);
__decorate([
    (0, common_1.Put)(':id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update error status' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Updates the status of an error log' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LoggerController.prototype, "updateErrorStatus", null);
exports.LoggerController = LoggerController = __decorate([
    (0, swagger_1.ApiTags)('Error Logging'),
    (0, common_1.Controller)('errors'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [error_tracking_service_1.ErrorTrackingService])
], LoggerController);
//# sourceMappingURL=logger.controller.js.map