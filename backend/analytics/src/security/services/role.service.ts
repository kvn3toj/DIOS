import { Injectable, Logger, ConflictException, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { PermissionService } from './permission.service';

interface CreateRoleDto {
  name: string;
  description?: string;
  isSystem?: boolean;
  permissions?: {
    resourceId: string;
    actionId: string;
    conditions?: Record<string, any>;
    isAllowed: boolean;
  }[];
}

interface UpdateRoleDto {
  name?: string;
  description?: string;
  isSystem?: boolean;
}

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly permissionService: PermissionService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createRole(dto: CreateRoleDto) {
    try {
      // Check if role with same name exists
      const existingRole = await this.prisma.role.findUnique({
        where: { name: dto.name },
      });

      if (existingRole) {
        throw new ConflictException(`Role with name ${dto.name} already exists`);
      }

      // Create role
      const role = await this.prisma.role.create({
        data: {
          name: dto.name,
          description: dto.description,
          isSystem: dto.isSystem || false,
        },
      });

      // Grant permissions if provided
      if (dto.permissions) {
        await Promise.all(
          dto.permissions.map(permission =>
            this.permissionService.grantRolePermission({
              roleId: role.id,
              ...permission,
            }),
          ),
        );
      }

      this.eventEmitter.emit('role.created', {
        roleId: role.id,
        name: role.name,
        timestamp: new Date(),
      });

      return role;
    } catch (error) {
      this.logger.error('Failed to create role:', error);
      throw error;
    }
  }

  async updateRole(roleId: string, dto: UpdateRoleDto) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      // Check name uniqueness if name is being updated
      if (dto.name && dto.name !== role.name) {
        const existingRole = await this.prisma.role.findUnique({
          where: { name: dto.name },
        });

        if (existingRole) {
          throw new ConflictException(`Role with name ${dto.name} already exists`);
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
    } catch (error) {
      this.logger.error('Failed to update role:', error);
      throw error;
    }
  }

  async deleteRole(roleId: string) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      if (role.isSystem) {
        throw new ConflictException('Cannot delete system roles');
      }

      // Delete role and associated permissions (cascade delete)
      await this.prisma.role.delete({
        where: { id: roleId },
      });

      this.eventEmitter.emit('role.deleted', {
        roleId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to delete role:', error);
      throw error;
    }
  }

  async assignRoleToUser(userId: string, roleId: string) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
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
    } catch (error) {
      this.logger.error('Failed to assign role to user:', error);
      throw error;
    }
  }

  async removeRoleFromUser(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { role: 'USER' }, // Reset to default role
      });

      this.eventEmitter.emit('role.removed', {
        userId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to remove role from user:', error);
      throw error;
    }
  }

  async getRoleById(roleId: string) {
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
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      return role;
    } catch (error) {
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
    } catch (error) {
      this.logger.error('Failed to get roles:', error);
      throw error;
    }
  }

  async getUserRole(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return user.role;
    } catch (error) {
      this.logger.error('Failed to get user role:', error);
      throw error;
    }
  }

  async getRolePermissions(roleId: string) {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id: roleId },
      });

      if (!role) {
        throw new NotFoundException(`Role with ID ${roleId} not found`);
      }

      return await this.prisma.rolePermission.findMany({
        where: { roleId },
        include: {
          resource: true,
          action: true,
        },
      });
    } catch (error) {
      this.logger.error('Failed to get role permissions:', error);
      throw error;
    }
  }
} 