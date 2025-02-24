import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { UserManagementService, CreateUserDto, UpdateUserDto, UserFilters } from '../services/user-management.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserManagementController {
  private readonly logger = new Logger(UserManagementController.name);

  constructor(private readonly userManagementService: UserManagementService) {}

  @Post()
  @RequirePermission({ resource: 'users', action: 'create' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.userManagementService.createUser(createUserDto);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      this.logger.error('Failed to create user:', error);
      throw error;
    }
  }

  @Put(':userId')
  @RequirePermission({ resource: 'users', action: 'update' })
  async updateUser(
    @Param('userId') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.userManagementService.updateUser(userId, updateUserDto);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      this.logger.error(`Failed to update user ${userId}:`, error);
      throw error;
    }
  }

  @Delete(':userId')
  @RequirePermission({ resource: 'users', action: 'delete' })
  async deleteUser(@Param('userId') userId: string) {
    try {
      await this.userManagementService.deleteUser(userId);
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Failed to delete user ${userId}:`, error);
      throw error;
    }
  }

  @Get(':userId')
  @RequirePermission({ resource: 'users', action: 'read' })
  async getUser(@Param('userId') userId: string) {
    try {
      const user = await this.userManagementService.getUser(userId);
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      this.logger.error(`Failed to get user ${userId}:`, error);
      throw error;
    }
  }

  @Get()
  @RequirePermission({ resource: 'users', action: 'list' })
  async getUsers(
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('isVerified') isVerified?: boolean,
    @Query('hasCompletedSetup') hasCompletedSetup?: boolean,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    try {
      const filters: UserFilters = {
        search,
        role,
        isVerified,
        hasCompletedSetup,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit,
        offset,
      };

      const result = await this.userManagementService.getUsers(filters);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to get users:', error);
      throw error;
    }
  }

  @Put(':userId/setup-progress')
  @RequirePermission({ resource: 'users', action: 'update' })
  async updateUserSetupProgress(
    @Param('userId') userId: string,
    @Body('step') step: string,
    @Body('completed') completed: boolean,
  ) {
    try {
      const progress = await this.userManagementService.updateUserSetupProgress(
        userId,
        step,
        completed,
      );
      return {
        success: true,
        data: progress,
      };
    } catch (error) {
      this.logger.error(`Failed to update setup progress for user ${userId}:`, error);
      throw error;
    }
  }

  @Put(':userId/complete-setup')
  @RequirePermission({ resource: 'users', action: 'update' })
  async completeUserSetup(@Param('userId') userId: string) {
    try {
      const result = await this.userManagementService.completeUserSetup(userId);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error(`Failed to complete setup for user ${userId}:`, error);
      throw error;
    }
  }
} 