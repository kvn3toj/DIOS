import { Controller, Get, Query, UseGuards, ParseIntPipe, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RequirePermission } from '../decorators/require-permission.decorator';
import { AuditLogService, AuditEventType } from '../services/audit-log.service';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditLogController {
  private readonly logger = new Logger(AuditLogController.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @Get('logs')
  @RequirePermission({ resource: 'audit_logs', action: 'read' })
  async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('eventType') eventType?: AuditEventType,
    @Query('status') status?: 'success' | 'failure',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit', ParseIntPipe) limit = 50,
    @Query('offset', ParseIntPipe) offset = 0,
  ) {
    try {
      const filters = {
        userId,
        eventType,
        status,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit,
        offset,
      };

      const result = await this.auditLogService.getAuditLogs(filters);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to get audit logs:', error);
      throw error;
    }
  }

  @Get('alerts')
  @RequirePermission({ resource: 'security_alerts', action: 'read' })
  async getSecurityAlerts(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('severity') severity?: 'low' | 'medium' | 'high',
    @Query('limit', ParseIntPipe) limit = 50,
    @Query('offset', ParseIntPipe) offset = 0,
  ) {
    try {
      const options = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        severity,
        limit,
        offset,
      };

      const result = await this.auditLogService.getSecurityAlerts(options);
      
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      this.logger.error('Failed to get security alerts:', error);
      throw error;
    }
  }
} 