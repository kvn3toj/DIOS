import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';

interface PermissionCheck {
  userId: string;
  resourceId: string;
  actionId: string;
  conditions?: Record<string, any>;
}

interface PermissionGrant {
  userId: string;
  resourceId: string;
  actionId: string;
  conditions?: Record<string, any>;
  isAllowed: boolean;
  expiresAt?: Date;
}

interface RolePermissionGrant {
  roleId: string;
  resourceId: string;
  actionId: string;
  conditions?: Record<string, any>;
  isAllowed: boolean;
}

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async checkPermission({ userId, resourceId, actionId, conditions }: PermissionCheck): Promise<boolean> {
    try {
      // Get user's direct permissions
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
          return this.evaluateConditions(directPermission.conditions as Record<string, any>, conditions);
        }

        return directPermission.isAllowed;
      }

      // Get user's role
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user) {
        return false;
      }

      // Check role-based permissions
      const rolePermission = await this.getRolePermission(user.role, resourceId, actionId);
      if (rolePermission) {
        if (rolePermission.conditions && conditions) {
          return this.evaluateConditions(rolePermission.conditions as Record<string, any>, conditions);
        }
        return rolePermission.isAllowed;
      }

      // Check inherited permissions
      const hasInheritedPermission = await this.checkInheritedPermissions(user.role, resourceId, actionId, conditions);
      if (hasInheritedPermission !== null) {
        return hasInheritedPermission;
      }

      return false;
    } catch (error) {
      this.logger.error('Failed to check permission:', error);
      return false;
    }
  }

  async grantPermission(grant: PermissionGrant): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to grant permission:', error);
      throw error;
    }
  }

  async grantRolePermission(grant: RolePermissionGrant): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to grant role permission:', error);
      throw error;
    }
  }

  async revokePermission(userId: string, resourceId: string, actionId: string): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to revoke permission:', error);
      throw error;
    }
  }

  async revokeRolePermission(roleId: string, resourceId: string, actionId: string): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to revoke role permission:', error);
      throw error;
    }
  }

  async addRoleInheritance(parentRoleId: string, childRoleId: string): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to add role inheritance:', error);
      throw error;
    }
  }

  async removeRoleInheritance(parentRoleId: string, childRoleId: string): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to remove role inheritance:', error);
      throw error;
    }
  }

  private async getRolePermission(roleId: string, resourceId: string, actionId: string): Promise<RolePermissionGrant | null> {
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
    } catch (error) {
      this.logger.error('Failed to get role permission:', error);
      return null;
    }
  }

  private async checkInheritedPermissions(
    roleId: string,
    resourceId: string,
    actionId: string,
    conditions?: Record<string, any>,
  ): Promise<boolean | null> {
    try {
      // Get all parent roles
      const inheritances = await this.prisma.permissionInheritance.findMany({
        where: { childRoleId: roleId },
      });

      for (const inheritance of inheritances) {
        const parentPermission = await this.getRolePermission(
          inheritance.parentRoleId,
          resourceId,
          actionId,
        );

        if (parentPermission) {
          if (parentPermission.conditions && conditions) {
            return this.evaluateConditions(parentPermission.conditions as Record<string, any>, conditions);
          }
          return parentPermission.isAllowed;
        }

        // Recursively check parent roles
        const parentResult = await this.checkInheritedPermissions(
          inheritance.parentRoleId,
          resourceId,
          actionId,
          conditions,
        );

        if (parentResult !== null) {
          return parentResult;
        }
      }

      return null;
    } catch (error) {
      this.logger.error('Failed to check inherited permissions:', error);
      return null;
    }
  }

  private evaluateConditions(permissionConditions: Record<string, any>, requestConditions: Record<string, any>): boolean {
    try {
      // Implement condition evaluation logic here
      // This is a simple example; you might want to implement more complex condition matching
      for (const [key, value] of Object.entries(permissionConditions)) {
        if (requestConditions[key] !== value) {
          return false;
        }
      }
      return true;
    } catch (error) {
      this.logger.error('Failed to evaluate conditions:', error);
      return false;
    }
  }
} 