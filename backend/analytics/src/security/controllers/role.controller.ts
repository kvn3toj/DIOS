import { Controller, Post, Put, Delete, Get, Body, Param, Query, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RoleService } from '../services/role.service';

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

@Controller('auth/roles')
@UseGuards(JwtAuthGuard)
export class RoleController {
  private readonly logger = new Logger(RoleController.name);

  constructor(private readonly roleService: RoleService) {}

  @Post()
  async createRole(@Body() dto: CreateRoleDto) {
    try {
      const role = await this.roleService.createRole(dto);
      return {
        success: true,
        message: 'Role created successfully',
        data: role,
      };
    } catch (error) {
      this.logger.error('Failed to create role:', error);
      throw new HttpException(
        error.message || 'Failed to create role',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':roleId')
  async updateRole(
    @Param('roleId') roleId: string,
    @Body() dto: UpdateRoleDto,
  ) {
    try {
      const role = await this.roleService.updateRole(roleId, dto);
      return {
        success: true,
        message: 'Role updated successfully',
        data: role,
      };
    } catch (error) {
      this.logger.error('Failed to update role:', error);
      throw new HttpException(
        error.message || 'Failed to update role',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':roleId')
  async deleteRole(@Param('roleId') roleId: string) {
    try {
      await this.roleService.deleteRole(roleId);
      return {
        success: true,
        message: 'Role deleted successfully',
      };
    } catch (error) {
      this.logger.error('Failed to delete role:', error);
      throw new HttpException(
        error.message || 'Failed to delete role',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('assign/:userId/:roleId')
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    try {
      await this.roleService.assignRoleToUser(userId, roleId);
      return {
        success: true,
        message: 'Role assigned successfully',
      };
    } catch (error) {
      this.logger.error('Failed to assign role:', error);
      throw new HttpException(
        error.message || 'Failed to assign role',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete('remove/:userId')
  async removeRoleFromUser(@Param('userId') userId: string) {
    try {
      await this.roleService.removeRoleFromUser(userId);
      return {
        success: true,
        message: 'Role removed successfully',
      };
    } catch (error) {
      this.logger.error('Failed to remove role:', error);
      throw new HttpException(
        error.message || 'Failed to remove role',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':roleId')
  async getRole(@Param('roleId') roleId: string) {
    try {
      const role = await this.roleService.getRoleById(roleId);
      return {
        success: true,
        data: role,
      };
    } catch (error) {
      this.logger.error('Failed to get role:', error);
      throw new HttpException(
        error.message || 'Failed to get role',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getRoles(@Query('includeSystem') includeSystem?: boolean) {
    try {
      const roles = await this.roleService.getRoles(includeSystem);
      return {
        success: true,
        data: roles,
      };
    } catch (error) {
      this.logger.error('Failed to get roles:', error);
      throw new HttpException(
        error.message || 'Failed to get roles',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:userId')
  async getUserRole(@Param('userId') userId: string) {
    try {
      const role = await this.roleService.getUserRole(userId);
      return {
        success: true,
        data: role,
      };
    } catch (error) {
      this.logger.error('Failed to get user role:', error);
      throw new HttpException(
        error.message || 'Failed to get user role',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':roleId/permissions')
  async getRolePermissions(@Param('roleId') roleId: string) {
    try {
      const permissions = await this.roleService.getRolePermissions(roleId);
      return {
        success: true,
        data: permissions,
      };
    } catch (error) {
      this.logger.error('Failed to get role permissions:', error);
      throw new HttpException(
        error.message || 'Failed to get role permissions',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 