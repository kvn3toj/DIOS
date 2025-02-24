import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ErrorTrackingService } from './error-tracking.service';

@ApiTags('Error Logging')
@Controller('errors')
@UseGuards(JwtAuthGuard)
export class LoggerController {
  constructor(
    private readonly errorTrackingService: ErrorTrackingService
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get error logs' })
  @ApiQuery({ name: 'start', required: false, type: String })
  @ApiQuery({ name: 'end', required: false, type: String })
  @ApiQuery({ name: 'context', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Returns error logs for the specified time range and context' })
  async getErrors(
    @Query('start') start?: string,
    @Query('end') end?: string,
    @Query('context') context?: string,
  ) {
    const timeRange = start && end ? {
      start: new Date(start),
      end: new Date(end),
    } : undefined;

    return this.errorTrackingService.getErrors(timeRange, context);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get error analytics' })
  @ApiQuery({ name: 'start', required: true, type: String })
  @ApiQuery({ name: 'end', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Returns error analytics for the specified time range' })
  async getErrorAnalytics(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    const timeRange = {
      start: new Date(start),
      end: new Date(end),
    };

    return this.errorTrackingService.getErrorAnalytics(timeRange);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update error status' })
  @ApiResponse({ status: 200, description: 'Updates the status of an error log' })
  async updateErrorStatus(
    @Param('id') id: string,
    @Body() updateData: {
      status: 'new' | 'investigating' | 'resolved' | 'ignored';
      resolution?: string;
      resolvedBy?: string;
    }
  ) {
    const errorLog = await this.errorTrackingService.getErrors(undefined, undefined);
    const error = errorLog.find(e => e.id === id);
    
    if (!error) {
      return { success: false, message: 'Error log not found' };
    }

    error.status = updateData.status;
    if (updateData.status === 'resolved') {
      error.resolvedAt = new Date();
      error.resolvedBy = updateData.resolvedBy;
      error.resolution = updateData.resolution;
    }

    await this.errorTrackingService['errorLogRepository'].save(error);
    return { success: true, error };
  }
} 