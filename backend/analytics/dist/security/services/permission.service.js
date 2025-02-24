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
var PermissionService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
let PermissionService = PermissionService_1 = class PermissionService {
    constructor(prisma, eventEmitter) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(PermissionService_1.name);
    }
    async checkPermission({ userId, resourceId, actionId, conditions }) {
        try {
            const directPermission = await this.prisma.permission.findUnique({
                where: {
                    userId_resourceId_actionId: {
                        userId,
                        resourceId,
                        actionId,
                    },
                },
            });
            if (directPermission) {
                if (directPermission.expiresAt && directPermission.expiresAt < new Date()) {
                    return false;
                }
                if (directPermission.conditions && conditions) {
                    return this.evaluateConditions(directPermission.conditions, conditions);
                }
                return directPermission.isAllowed;
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { role: true },
            });
            if (!user) {
                return false;
            }
            const rolePermission = await this.getRolePermission(user.role, resourceId, actionId);
            if (rolePermission) {
                if (rolePermission.conditions && conditions) {
                    return this.evaluateConditions(rolePermission.conditions, conditions);
                }
                return rolePermission.isAllowed;
            }
            const hasInheritedPermission = await this.checkInheritedPermissions(user.role, resourceId, actionId, conditions);
            if (hasInheritedPermission !== null) {
                return hasInheritedPermission;
            }
            return false;
        }
        catch (error) {
            this.logger.error('Failed to check permission:', error);
            return false;
        }
    }
    async grantPermission(grant) {
        try {
            await this.prisma.permission.upsert({
                where: {
                    userId_resourceId_actionId: {
                        userId: grant.userId,
                        resourceId: grant.resourceId,
                        actionId: grant.actionId,
                    },
                },
                update: {
                    isAllowed: grant.isAllowed,
                    conditions: grant.conditions,
                    expiresAt: grant.expiresAt,
                    updatedAt: new Date(),
                },
                create: {
                    userId: grant.userId,
                    resourceId: grant.resourceId,
                    actionId: grant.actionId,
                    isAllowed: grant.isAllowed,
                    conditions: grant.conditions,
                    expiresAt: grant.expiresAt,
                },
            });
            this.eventEmitter.emit('permission.granted', {
                ...grant,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to grant permission:', error);
            throw error;
        }
    }
    async grantRolePermission(grant) {
        try {
            await this.prisma.rolePermission.upsert({
                where: {
                    roleId_resourceId_actionId: {
                        roleId: grant.roleId,
                        resourceId: grant.resourceId,
                        actionId: grant.actionId,
                    },
                },
                update: {
                    isAllowed: grant.isAllowed,
                    conditions: grant.conditions,
                    updatedAt: new Date(),
                },
                create: {
                    roleId: grant.roleId,
                    resourceId: grant.resourceId,
                    actionId: grant.actionId,
                    isAllowed: grant.isAllowed,
                    conditions: grant.conditions,
                },
            });
            this.eventEmitter.emit('role.permission.granted', {
                ...grant,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to grant role permission:', error);
            throw error;
        }
    }
    async revokePermission(userId, resourceId, actionId) {
        try {
            await this.prisma.permission.delete({
                where: {
                    userId_resourceId_actionId: {
                        userId,
                        resourceId,
                        actionId,
                    },
                },
            });
            this.eventEmitter.emit('permission.revoked', {
                userId,
                resourceId,
                actionId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to revoke permission:', error);
            throw error;
        }
    }
    async revokeRolePermission(roleId, resourceId, actionId) {
        try {
            await this.prisma.rolePermission.delete({
                where: {
                    roleId_resourceId_actionId: {
                        roleId,
                        resourceId,
                        actionId,
                    },
                },
            });
            this.eventEmitter.emit('role.permission.revoked', {
                roleId,
                resourceId,
                actionId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to revoke role permission:', error);
            throw error;
        }
    }
    async addRoleInheritance(parentRoleId, childRoleId) {
        try {
            await this.prisma.permissionInheritance.create({
                data: {
                    parentRoleId,
                    childRoleId,
                },
            });
            this.eventEmitter.emit('role.inheritance.added', {
                parentRoleId,
                childRoleId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to add role inheritance:', error);
            throw error;
        }
    }
    async removeRoleInheritance(parentRoleId, childRoleId) {
        try {
            await this.prisma.permissionInheritance.delete({
                where: {
                    parentRoleId_childRoleId: {
                        parentRoleId,
                        childRoleId,
                    },
                },
            });
            this.eventEmitter.emit('role.inheritance.removed', {
                parentRoleId,
                childRoleId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to remove role inheritance:', error);
            throw error;
        }
    }
    async getRolePermission(roleId, resourceId, actionId) {
        try {
            const rolePermission = await this.prisma.rolePermission.findUnique({
                where: {
                    roleId_resourceId_actionId: {
                        roleId,
                        resourceId,
                        actionId,
                    },
                },
            });
            return rolePermission;
        }
        catch (error) {
            this.logger.error('Failed to get role permission:', error);
            return null;
        }
    }
    async checkInheritedPermissions(roleId, resourceId, actionId, conditions) {
        try {
            const inheritances = await this.prisma.permissionInheritance.findMany({
                where: { childRoleId: roleId },
            });
            for (const inheritance of inheritances) {
                const parentPermission = await this.getRolePermission(inheritance.parentRoleId, resourceId, actionId);
                if (parentPermission) {
                    if (parentPermission.conditions && conditions) {
                        return this.evaluateConditions(parentPermission.conditions, conditions);
                    }
                    return parentPermission.isAllowed;
                }
                const parentResult = await this.checkInheritedPermissions(inheritance.parentRoleId, resourceId, actionId, conditions);
                if (parentResult !== null) {
                    return parentResult;
                }
            }
            return null;
        }
        catch (error) {
            this.logger.error('Failed to check inherited permissions:', error);
            return null;
        }
    }
    evaluateConditions(permissionConditions, requestConditions) {
        try {
            for (const [key, value] of Object.entries(permissionConditions)) {
                if (requestConditions[key] !== value) {
                    return false;
                }
            }
            return true;
        }
        catch (error) {
            this.logger.error('Failed to evaluate conditions:', error);
            return false;
        }
    }
};
exports.PermissionService = PermissionService;
exports.PermissionService = PermissionService = PermissionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], PermissionService);
//# sourceMappingURL=permission.service.js.map