import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../security/guards/jwt-auth.guard';
import { RequirePermission } from '../security/decorators/require-permission.decorator';
import { MetricsService } from '../services/metrics.service';

@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  private readonly logger = new Logger(MetricsController.name);

  constructor(private readonly metricsService: MetricsService) {}

  @Get('performance')
  @RequirePermission({ resource: 'metrics', action: 'read' })
  async getPerformanceMetrics() {
    try {
      const metrics = await this.metricsService.collectPerformanceMetrics();
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      this.logger.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  @Get('quality')
  @RequirePermission({ resource: 'metrics', action: 'read' })
  async getQualityMetrics() {
    try {
      const metrics = await this.metricsService.collectQualityMetrics();
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      this.logger.error('Failed to get quality metrics:', error);
      throw error;
    }
  }

  @Get('engagement')
  @RequirePermission({ resource: 'metrics', action: 'read' })
  async getEngagementMetrics() {
    try {
      const metrics = await this.metricsService.collectEngagementMetrics();
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      this.logger.error('Failed to get engagement metrics:', error);
      throw error;
    }
  }

  @Get('monetization')
  @RequirePermission({ resource: 'metrics', action: 'read' })
  async getMonetizationMetrics() {
    try {
      const metrics = await this.metricsService.collectMonetizationMetrics();
      return {
        success: true,
        data: metrics,
      };
    } catch (error) {
      this.logger.error('Failed to get monetization metrics:', error);
      throw error;
    }
  }

  @Get('dashboard')
  @RequirePermission({ resource: 'metrics', action: 'read' })
  async getDashboardMetrics() {
    try {
      const [performance, quality, engagement, monetization] = await Promise.all([
        this.metricsService.collectPerformanceMetrics(),
        this.metricsService.collectQualityMetrics(),
        this.metricsService.collectEngagementMetrics(),
        this.metricsService.collectMonetizationMetrics(),
      ]);

      return {
        success: true,
        data: {
          performance,
          quality,
          engagement,
          monetization,
        },
      };
    } catch (error) {
      this.logger.error('Failed to get dashboard metrics:', error);
      throw error;
    }
  }
} 