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
var UserManagementService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const audit_log_service_1 = require("./audit-log.service");
const role_service_1 = require("./role.service");
let UserManagementService = UserManagementService_1 = class UserManagementService {
    constructor(prisma, eventEmitter, auditLogService, roleService) {
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.auditLogService = auditLogService;
        this.roleService = roleService;
        this.logger = new common_1.Logger(UserManagementService_1.name);
    }
    async createUser(createUserDto, creatorId) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email: createUserDto.email },
            });
            if (existingUser) {
                throw new common_1.ConflictException('User with this email already exists');
            }
            const user = await this.prisma.user.create({
                data: {
                    email: createUserDto.email,
                    password: createUserDto.password,
                    name: createUserDto.name,
                    role: createUserDto.role || 'USER',
                },
            });
            if (createUserDto.role) {
                await this.roleService.assignRoleToUser(user.id, createUserDto.role);
            }
            this.eventEmitter.emit('user.created', { userId: user.id, creatorId });
            await this.auditLogService.logAuditEvent({
                userId: creatorId,
                eventType: 'user.create',
                resourceType: 'user',
                resourceId: user.id,
                action: 'create',
                status: 'success',
                details: { email: user.email, role: user.role },
                timestamp: new Date(),
            });
            return user;
        }
        catch (error) {
            this.logger.error('Failed to create user:', error);
            throw error;
        }
    }
    async updateUser(userId, updateUserDto, updaterId) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            if (updateUserDto.email && updateUserDto.email !== user.email) {
                const existingUser = await this.prisma.user.findUnique({
                    where: { email: updateUserDto.email },
                });
                if (existingUser) {
                    throw new common_1.ConflictException('Email already in use');
                }
            }
            const updatedUser = await this.prisma.user.update({
                where: { id: userId },
                data: updateUserDto,
            });
            if (updateUserDto.role && updateUserDto.role !== user.role) {
                await this.roleService.assignRoleToUser(userId, updateUserDto.role);
            }
            this.eventEmitter.emit('user.updated', { userId, updaterId });
            await this.auditLogService.logAuditEvent({
                userId: updaterId,
                eventType: 'user.update',
                resourceType: 'user',
                resourceId: userId,
                action: 'update',
                status: 'success',
                details: updateUserDto,
                timestamp: new Date(),
            });
            return updatedUser;
        }
        catch (error) {
            this.logger.error(`Failed to update user ${userId}:`, error);
            throw error;
        }
    }
    async deleteUser(userId, deleterId) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            await this.prisma.user.delete({ where: { id: userId } });
            this.eventEmitter.emit('user.deleted', { userId, deleterId });
            await this.auditLogService.logAuditEvent({
                userId: deleterId,
                eventType: 'user.delete',
                resourceType: 'user',
                resourceId: userId,
                action: 'delete',
                status: 'success',
                details: { email: user.email },
                timestamp: new Date(),
            });
            return true;
        }
        catch (error) {
            this.logger.error(`Failed to delete user ${userId}:`, error);
            throw error;
        }
    }
    async getUser(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: {
                    permissions: true,
                    setupProgress: true,
                },
            });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            return user;
        }
        catch (error) {
            this.logger.error(`Failed to get user ${userId}:`, error);
            throw error;
        }
    }
    async getUsers(filters) {
        try {
            const where = {};
            if (filters.search) {
                where.OR = [
                    { email: { contains: filters.search, mode: 'insensitive' } },
                    { name: { contains: filters.search, mode: 'insensitive' } },
                ];
            }
            if (filters.role)
                where.role = filters.role;
            if (filters.isVerified !== undefined)
                where.isVerified = filters.isVerified;
            if (filters.hasCompletedSetup !== undefined)
                where.hasCompletedSetup = filters.hasCompletedSetup;
            if (filters.startDate || filters.endDate) {
                where.createdAt = {};
                if (filters.startDate)
                    where.createdAt.gte = filters.startDate;
                if (filters.endDate)
                    where.createdAt.lte = filters.endDate;
            }
            const total = await this.prisma.user.count({ where });
            const users = await this.prisma.user.findMany({
                where,
                include: {
                    permissions: true,
                    setupProgress: true,
                },
                take: filters.limit || 50,
                skip: filters.offset || 0,
                orderBy: { createdAt: 'desc' },
            });
            return {
                total,
                users,
            };
        }
        catch (error) {
            this.logger.error('Failed to get users:', error);
            throw error;
        }
    }
    async updateUserSetupProgress(userId, step, completed) {
        try {
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user) {
                throw new common_1.NotFoundException('User not found');
            }
            let setupProgress = await this.prisma.userSetupProgress.findUnique({
                where: { userId },
            });
            if (!setupProgress) {
                setupProgress = await this.prisma.userSetupProgress.create({
                    data: {
                        userId,
                        currentStep: step,
                        completedSteps: completed ? [step] : [],
                        isCompleted: false,
                    },
                });
            }
            else {
                const completedSteps = new Set(setupProgress.completedSteps);
                if (completed) {
                    completedSteps.add(step);
                }
                else {
                    completedSteps.delete(step);
                }
                setupProgress = await this.prisma.userSetupProgress.update({
                    where: { userId },
                    data: {
                        currentStep: step,
                        completedSteps: Array.from(completedSteps),
                        isCompleted: false,
                    },
                });
            }
            this.eventEmitter.emit('user.setup.progress', {
                userId,
                step,
                completed,
                progress: setupProgress,
            });
            return setupProgress;
        }
        catch (error) {
            this.logger.error(`Failed to update setup progress for user ${userId}:`, error);
            throw error;
        }
    }
    async completeUserSetup(userId) {
        try {
            const [user, setupProgress] = await Promise.all([
                this.prisma.user.update({
                    where: { id: userId },
                    data: { hasCompletedSetup: true },
                }),
                this.prisma.userSetupProgress.update({
                    where: { userId },
                    data: { isCompleted: true },
                }),
            ]);
            this.eventEmitter.emit('user.setup.completed', { userId });
            return { user, setupProgress };
        }
        catch (error) {
            this.logger.error(`Failed to complete setup for user ${userId}:`, error);
            throw error;
        }
    }
};
exports.UserManagementService = UserManagementService;
exports.UserManagementService = UserManagementService = UserManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object, audit_log_service_1.AuditLogService,
        role_service_1.RoleService])
], UserManagementService);
//# sourceMappingURL=user-management.service.js.map