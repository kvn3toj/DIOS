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
exports.PermissionsGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const authorization_service_1 = require("../services/authorization.service");
let PermissionsGuard = class PermissionsGuard {
    constructor(reflector, authorizationService) {
        this.reflector = reflector;
        this.authorizationService = authorizationService;
    }
    canActivate(context) {
        const requiredPermissions = this.reflector.getAllAndOverride('permissions', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredPermissions) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user || !user.userId || !user.roles) {
            return false;
        }
        const contextData = this.getContextData(request);
        return this.checkPermissions(user.userId, user.roles, requiredPermissions, contextData);
    }
    async checkPermissions(userId, roles, permissions, context) {
        try {
            for (const permission of permissions) {
                const hasPermission = await this.authorizationService.checkPermission(userId, roles, permission.resource, permission.action, context);
                if (!hasPermission) {
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            return false;
        }
    }
    getContextData(request) {
        return {
            ip: request.ip,
            timestamp: new Date(),
            method: request.method,
            path: request.path,
            params: request.params,
            query: request.query,
            headers: {
                userAgent: request.headers['user-agent'],
                origin: request.headers.origin,
            },
        };
    }
};
exports.PermissionsGuard = PermissionsGuard;
exports.PermissionsGuard = PermissionsGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        authorization_service_1.AuthorizationService])
], PermissionsGuard);
//# sourceMappingURL=permissions.guard.js.map