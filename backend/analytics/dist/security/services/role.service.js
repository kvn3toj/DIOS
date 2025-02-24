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
var RoleService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
const permission_service_1 = require("./permission.service");
let RoleService = RoleService_1 = class RoleService {
    constructor(prisma, permissionService, eventEmitter) {
        this.prisma = prisma;
        this.permissionService = permissionService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(RoleService_1.name);
    }
    async createRole(dto) {
        try {
            const existingRole = await this.prisma.role.findUnique({
                where: { name: dto.name },
            });
            if (existingRole) {
                throw new common_1.ConflictException(`Role with name ${dto.name} already exists`);
            }
            const role = await this.prisma.role.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                    isSystem: dto.isSystem || false,
                },
            });
            if (dto.permissions) {
                await Promise.all(dto.permissions.map(permission => this.permissionService.grantRolePermission({
                    roleId: role.id,
                    ...permission,
                })));
            }
            this.eventEmitter.emit('role.created', {
                roleId: role.id,
                name: role.name,
                timestamp: new Date(),
            });
            return role;
        }
        catch (error) {
            this.logger.error('Failed to create role:', error);
            throw error;
        }
    }
    async updateRole(roleId, dto) {
        try {
            const role = await this.prisma.role.findUnique({
                where: { id: roleId },
            });
            if (!role) {
                throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
            }
            if (dto.name && dto.name !== role.name) {
                const existingRole = await this.prisma.role.findUnique({
                    where: { name: dto.name },
                });
                if (existingRole) {
                    throw new common_1.ConflictException(`Role with name ${dto.name} already exists`);
                }
            }
            const updatedRole = await this.prisma.role.update({
                where: { id: roleId },
                data: dto,
            });
            this.eventEmitter.emit('role.updated', {
                roleId,
                updates: dto,
                timestamp: new Date(),
            });
            return updatedRole;
        }
        catch (error) {
            this.logger.error('Failed to update role:', error);
            throw error;
        }
    }
    async deleteRole(roleId) {
        try {
            const role = await this.prisma.role.findUnique({
                where: { id: roleId },
            });
            if (!role) {
                throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
            }
            if (role.isSystem) {
                throw new common_1.ConflictException('Cannot delete system roles');
            }
            await this.prisma.role.delete({
                where: { id: roleId },
            });
            this.eventEmitter.emit('role.deleted', {
                roleId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to delete role:', error);
            throw error;
        }
    }
    async assignRoleToUser(userId, roleId) {
        try {
            const role = await this.prisma.role.findUnique({
                where: { id: roleId },
            });
            if (!role) {
                throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            await this.prisma.user.update({
                where: { id: userId },
                data: { role: roleId },
            });
            this.eventEmitter.emit('role.assigned', {
                userId,
                roleId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to assign role to user:', error);
            throw error;
        }
    }
    async removeRoleFromUser(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            await this.prisma.user.update({
                where: { id: userId },
                data: { role: 'USER' },
            });
            this.eventEmitter.emit('role.removed', {
                userId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to remove role from user:', error);
            throw error;
        }
    }
    async getRoleById(roleId) {
        try {
            const role = await this.prisma.role.findUnique({
                where: { id: roleId },
                include: {
                    _count: {
                        select: {
                            users: true,
                        },
                    },
                },
            });
            if (!role) {
                throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
            }
            return role;
        }
        catch (error) {
            this.logger.error('Failed to get role:', error);
            throw error;
        }
    }
    async getRoles(includeSystem = false) {
        try {
            return await this.prisma.role.findMany({
                where: includeSystem ? undefined : { isSystem: false },
                include: {
                    _count: {
                        select: {
                            users: true,
                        },
                    },
                },
                orderBy: { name: 'asc' },
            });
        }
        catch (error) {
            this.logger.error('Failed to get roles:', error);
            throw error;
        }
    }
    async getUserRole(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { role: true },
            });
            if (!user) {
                throw new common_1.NotFoundException(`User with ID ${userId} not found`);
            }
            return user.role;
        }
        catch (error) {
            this.logger.error('Failed to get user role:', error);
            throw error;
        }
    }
    async getRolePermissions(roleId) {
        try {
            const role = await this.prisma.role.findUnique({
                where: { id: roleId },
            });
            if (!role) {
                throw new common_1.NotFoundException(`Role with ID ${roleId} not found`);
            }
            return await this.prisma.rolePermission.findMany({
                where: { roleId },
                include: {
                    resource: true,
                    action: true,
                },
            });
        }
        catch (error) {
            this.logger.error('Failed to get role permissions:', error);
            throw error;
        }
    }
};
exports.RoleService = RoleService;
exports.RoleService = RoleService = RoleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, permission_service_1.PermissionService, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], RoleService);
//# sourceMappingURL=role.service.js.map