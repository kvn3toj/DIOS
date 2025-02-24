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
var AccessControlMiddleware_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccessControlMiddleware = void 0;
const common_1 = require("@nestjs/common");
const permission_service_1 = require("../services/permission.service");
let AccessControlMiddleware = AccessControlMiddleware_1 = class AccessControlMiddleware {
    constructor(permissionService) {
        this.permissionService = permissionService;
        this.logger = new common_1.Logger(AccessControlMiddleware_1.name);
    }
    create(options) {
        return async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    throw new common_1.UnauthorizedException('User not authenticated');
                }
                const requestConditions = {
                    ...options.conditions,
                    ip: req.ip,
                    method: req.method,
                    path: req.path,
                    ...(req.conditions || {}),
                };
                const hasPermission = await this.permissionService.checkPermission({
                    userId,
                    resourceId: options.resource,
                    actionId: options.action,
                    conditions: requestConditions,
                });
                if (!hasPermission) {
                    throw new common_1.UnauthorizedException('Insufficient permissions');
                }
                this.logger.debug(`Access granted for user ${userId} to ${options.resource}:${options.action}`);
                next();
            }
            catch (error) {
                this.logger.error('Access control check failed:', error);
                throw new common_1.UnauthorizedException(error.message || 'Access denied');
            }
        };
    }
};
exports.AccessControlMiddleware = AccessControlMiddleware;
exports.AccessControlMiddleware = AccessControlMiddleware = AccessControlMiddleware_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [permission_service_1.PermissionService])
], AccessControlMiddleware);
//# sourceMappingURL=access-control.middleware.js.map