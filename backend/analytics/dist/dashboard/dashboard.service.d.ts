import { AnalyticsService } from '../analytics/analytics.service';
import { ChartService } from './services/chart.service';
import { WidgetService } from './services/widget.service';
export declare class DashboardService {
    private readonly analyticsService;
    private readonly chartService;
    private readonly widgetService;
    constructor(analyticsService: AnalyticsService, chartService: ChartService, widgetService: WidgetService);
    getDashboardData(timeRange: {
        start: Date;
        end: Date;
    }): Promise<{
        userMetrics: {
            type: string;
            title: string;
            xAxis: {
                type: string;
                title: string;
            };
            yAxis: {
                title: string;
            };
            series: {
                name: string;
                data: {
                    x: number;
                    y: any;
                }[];
            }[];
        };
        systemMetrics: {
            type: string;
            title: string;
            xAxis: {
                type: string;
                title: string;
            };
            yAxis: {
                title: string;
            };
            series: {
                name: string;
                data: {
                    x: number;
                    y: any;
                }[];
            }[];
        };
        performanceMetrics: {
            type: string;
            title: string;
            xAxis: {
                type: string;
                title: string;
            };
            yAxis: {
                title: string;
            };
            series: {
                name: string;
                data: {
                    x: number;
                    y: any;
                }[];
            }[];
        };
        eventDistribution: {
            type: string;
            title: string;
            series: {
                name: string;
                value: unknown;
            }[];
        };
    }>;
    private getUserMetrics;
    private getSystemMetrics;
    private getPerformanceMetrics;
    private getEventDistribution;
    getCustomWidget(options: {
        type: string;
        timeRange: {
            start: Date;
            end: Date;
        };
        metrics?: string[];
        groupBy?: 'hour' | 'day' | 'week' | 'month';
    }): Promise<any>;
}
