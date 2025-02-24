import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { AnalyticsModule } from '../analytics/analytics.module';
import { ChartService } from './services/chart.service';
import { WidgetService } from './services/widget.service';

@Module({
  imports: [AnalyticsModule],
  controllers: [DashboardController],
  providers: [DashboardService, ChartService, WidgetService],
  exports: [DashboardService]
})
export class DashboardModule {} 