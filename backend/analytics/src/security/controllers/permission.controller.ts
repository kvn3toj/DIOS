import { Controller, Post, Body, Delete, Param, UseGuards, Get, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { PermissionService } from '../services/permission.service';
import { User } from '../decorators/user.decorator';

interface GrantPermissionDto {
  userId: string;
  resourceId: string;
  actionId: string;
  conditions?: Record<string, any>;
  isAllowed: boolean;
  expiresAt?: Date;
}

interface GrantRolePermissionDto {
  roleId: string;
  resourceId: string;
  actionId: string;
  conditions?: Record<string, any>;
  isAllowed: boolean;
}

interface RoleInheritanceDto {
  parentRoleId: string;
  childRoleId: string;
}

@Controller('auth/permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post('grant')
  async grantPermission(@Body() grant: GrantPermissionDto) {
    await this.permissionService.grantPermission(grant);
    return { success: true, message: 'Permission granted successfully' };
  }

  @Post('grant-role')
  async grantRolePermission(@Body() grant: GrantRolePermissionDto) {
    await this.permissionService.grantRolePermission(grant);
    return { success: true, message: 'Role permission granted successfully' };
  }

  @Delete('revoke/:userId/:resourceId/:actionId')
  async revokePermission(
    @Param('userId') userId: string,
    @Param('resourceId') resourceId: string,
    @Param('actionId') actionId: string,
  ) {
    await this.permissionService.revokePermission(userId, resourceId, actionId);
    return { success: true, message: 'Permission revoked successfully' };
  }

  @Delete('revoke-role/:roleId/:resourceId/:actionId')
  async revokeRolePermission(
    @Param('roleId') roleId: string,
    @Param('resourceId') resourceId: string,
    @Param('actionId') actionId: string,
  ) {
    await this.permissionService.revokeRolePermission(roleId, resourceId, actionId);
    return { success: true, message: 'Role permission revoked successfully' };
  }

  @Post('inheritance')
  async addRoleInheritance(@Body() inheritance: RoleInheritanceDto) {
    await this.permissionService.addRoleInheritance(
      inheritance.parentRoleId,
      inheritance.childRoleId,
    );
    return { success: true, message: 'Role inheritance added successfully' };
  }

  @Delete('inheritance/:parentRoleId/:childRoleId')
  async removeRoleInheritance(
    @Param('parentRoleId') parentRoleId: string,
    @Param('childRoleId') childRoleId: string,
  ) {
    await this.permissionService.removeRoleInheritance(parentRoleId, childRoleId);
    return { success: true, message: 'Role inheritance removed successfully' };
  }

  @Get('check')
  async checkPermission(
    @User('id') userId: string,
    @Query('resourceId') resourceId: string,
    @Query('actionId') actionId: string,
    @Query('conditions') conditions?: string,
  ) {
    const parsedConditions = conditions ? JSON.parse(conditions) : undefined;
    const hasPermission = await this.permissionService.checkPermission({
      userId,
      resourceId,
      actionId,
      conditions: parsedConditions,
    });
    return { success: true, hasPermission };
  }
} 