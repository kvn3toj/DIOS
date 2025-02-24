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
var PermissionGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const require_permission_decorator_1 = require("../decorators/require-permission.decorator");
const permission_service_1 = require("../services/permission.service");
let PermissionGuard = PermissionGuard_1 = class PermissionGuard {
    constructor(reflector, permissionService) {
        this.reflector = reflector;
        this.permissionService = permissionService;
        this.logger = new common_1.Logger(PermissionGuard_1.name);
    }
    async canActivate(context) {
        const permissionOptions = this.reflector.get(require_permission_decorator_1.PERMISSION_KEY, context.getHandler());
        if (!permissionOptions) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const userId = request.user?.id;
        if (!userId) {
            throw new common_1.UnauthorizedException('User not authenticated');
        }
        try {
            const requestConditions = {
                ...permissionOptions.conditions,
                ip: request.ip,
                method: request.method,
                path: request.path,
                ...(request.conditions || {}),
            };
            const hasPermission = await this.permissionService.checkPermission({
                userId,
                resourceId: permissionOptions.resource,
                actionId: permissionOptions.action,
                conditions: requestConditions,
            });
            if (!hasPermission) {
                this.logger.warn(`Access denied for user ${userId} to ${permissionOptions.resource}:${permissionOptions.action}`);
                return false;
            }
            this.logger.debug(`Access granted for user ${userId} to ${permissionOptions.resource}:${permissionOptions.action}`);
            return true;
        }
        catch (error) {
            this.logger.error('Permission check failed:', error);
            throw new common_1.UnauthorizedException('Permission check failed');
        }
    }
};
exports.PermissionGuard = PermissionGuard;
exports.PermissionGuard = PermissionGuard = PermissionGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        permission_service_1.PermissionService])
], PermissionGuard);
//# sourceMappingURL=permission.guard.js.map