import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLogService } from './audit-log.service';
import { RoleService } from './role.service';

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  role?: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  role?: string;
  isVerified?: boolean;
  hasCompletedSetup?: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  isVerified?: boolean;
  hasCompletedSetup?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

@Injectable()
export class UserManagementService {
  private readonly logger = new Logger(UserManagementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly auditLogService: AuditLogService,
    private readonly roleService: RoleService,
  ) {}

  async createUser(createUserDto: CreateUserDto, creatorId?: string) {
    try {
      // Check if user with email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Create the user
      const user = await this.prisma.user.create({
        data: {
          email: createUserDto.email,
          password: createUserDto.password, // Note: Password should be hashed before storage
          name: createUserDto.name,
          role: createUserDto.role || 'USER',
        },
      });

      // Assign default role if specified
      if (createUserDto.role) {
        await this.roleService.assignRoleToUser(user.id, createUserDto.role);
      }

      // Emit user created event
      this.eventEmitter.emit('user.created', { userId: user.id, creatorId });

      // Log audit event
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
    } catch (error) {
      this.logger.error('Failed to create user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto, updaterId?: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // If email is being updated, check for uniqueness
      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.prisma.user.findUnique({
          where: { email: updateUserDto.email },
        });

        if (existingUser) {
          throw new ConflictException('Email already in use');
        }
      }

      // Update user
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateUserDto,
      });

      // If role is being updated, update role assignment
      if (updateUserDto.role && updateUserDto.role !== user.role) {
        await this.roleService.assignRoleToUser(userId, updateUserDto.role);
      }

      // Emit user updated event
      this.eventEmitter.emit('user.updated', { userId, updaterId });

      // Log audit event
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
    } catch (error) {
      this.logger.error(`Failed to update user ${userId}:`, error);
      throw error;
    }
  }

  async deleteUser(userId: string, deleterId?: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Delete user
      await this.prisma.user.delete({ where: { id: userId } });

      // Emit user deleted event
      this.eventEmitter.emit('user.deleted', { userId, deleterId });

      // Log audit event
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
    } catch (error) {
      this.logger.error(`Failed to delete user ${userId}:`, error);
      throw error;
    }
  }

  async getUser(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          permissions: true,
          setupProgress: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      this.logger.error(`Failed to get user ${userId}:`, error);
      throw error;
    }
  }

  async getUsers(filters: UserFilters) {
    try {
      const where: any = {};

      // Apply filters
      if (filters.search) {
        where.OR = [
          { email: { contains: filters.search, mode: 'insensitive' } },
          { name: { contains: filters.search, mode: 'insensitive' } },
        ];
      }
      if (filters.role) where.role = filters.role;
      if (filters.isVerified !== undefined) where.isVerified = filters.isVerified;
      if (filters.hasCompletedSetup !== undefined) where.hasCompletedSetup = filters.hasCompletedSetup;
      if (filters.startDate || filters.endDate) {
        where.createdAt = {};
        if (filters.startDate) where.createdAt.gte = filters.startDate;
        if (filters.endDate) where.createdAt.lte = filters.endDate;
      }

      // Get total count
      const total = await this.prisma.user.count({ where });

      // Get users with pagination
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
    } catch (error) {
      this.logger.error('Failed to get users:', error);
      throw error;
    }
  }

  async updateUserSetupProgress(userId: string, step: string, completed: boolean) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      
      if (!user) {
        throw new NotFoundException('User not found');
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
      } else {
        const completedSteps = new Set(setupProgress.completedSteps);
        if (completed) {
          completedSteps.add(step);
        } else {
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

      // Emit setup progress event
      this.eventEmitter.emit('user.setup.progress', {
        userId,
        step,
        completed,
        progress: setupProgress,
      });

      return setupProgress;
    } catch (error) {
      this.logger.error(`Failed to update setup progress for user ${userId}:`, error);
      throw error;
    }
  }

  async completeUserSetup(userId: string) {
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

      // Emit setup completed event
      this.eventEmitter.emit('user.setup.completed', { userId });

      return { user, setupProgress };
    } catch (error) {
      this.logger.error(`Failed to complete setup for user ${userId}:`, error);
      throw error;
    }
  }
} 