import { Controller, Get, Post, Body, Param, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { SetupGuideService } from '../services/setup-guide.service';
import { User } from '../decorators/user.decorator';

@Controller('auth/setup')
@UseGuards(JwtAuthGuard)
export class SetupGuideController {
  private readonly logger = new Logger(SetupGuideController.name);

  constructor(private readonly setupGuideService: SetupGuideService) {}

  @Post('initialize')
  async initializeSetup(@User('id') userId: string) {
    try {
      const setupProgress = await this.setupGuideService.initializeSetup(userId);
      
      return {
        success: true,
        message: 'Setup initialized successfully',
        data: setupProgress,
      };
    } catch (error) {
      this.logger.error('Failed to initialize setup:', error);
      throw new HttpException(
        'Failed to initialize setup',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('complete/:stepId')
  async completeStep(
    @User('id') userId: string,
    @Param('stepId') stepId: string,
    @Body() data?: Record<string, any>,
  ) {
    try {
      const setupProgress = await this.setupGuideService.completeStep(userId, stepId, data);
      
      return {
        success: true,
        message: 'Step completed successfully',
        data: setupProgress,
      };
    } catch (error) {
      this.logger.error('Failed to complete step:', error);
      throw new HttpException(
        error.message || 'Failed to complete step',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('skip/:stepId')
  async skipStep(
    @User('id') userId: string,
    @Param('stepId') stepId: string,
  ) {
    try {
      const setupProgress = await this.setupGuideService.skipStep(userId, stepId);
      
      return {
        success: true,
        message: 'Step skipped successfully',
        data: setupProgress,
      };
    } catch (error) {
      this.logger.error('Failed to skip step:', error);
      throw new HttpException(
        error.message || 'Failed to skip step',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('progress')
  async getProgress(@User('id') userId: string) {
    try {
      const progress = await this.setupGuideService.getSetupProgress(userId);
      
      return {
        success: true,
        data: progress,
      };
    } catch (error) {
      this.logger.error('Failed to get setup progress:', error);
      throw new HttpException(
        'Failed to get setup progress',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
} 