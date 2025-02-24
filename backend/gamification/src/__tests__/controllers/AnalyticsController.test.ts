import { Request, Response, NextFunction } from 'express';
import { AnalyticsController } from '../../controllers/AnalyticsController';
import { AnalyticsService } from '../../services/AnalyticsService';
import { Analytics, AnalyticsType, AnalyticsCategory } from '../../models/Analytics';
import { APIError } from '../../middleware/errorHandler';

// Mock AnalyticsService
jest.mock('../../services/AnalyticsService');

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.Mock;
  let mockAnalytics: Partial<Analytics>;

  beforeEach(() => {
    controller = new AnalyticsController();
    mockAnalytics = {
      id: 'test-analytics-id',
      userId: 'test-user-id',
      type: AnalyticsType.USER_ACTION,
      category: AnalyticsCategory.ENGAGEMENT,
      event: 'test_event',
      data: {
        value: 100,
        metadata: { action: 'test' }
      },
      metrics: {
        duration: 1000,
        count: 1,
        value: 100
      },
      timestamp: new Date(),
      source: 'test',
      platform: 'web',
      version: '1.0',
      session: {
        id: 'test-session',
        startTime: new Date(),
        duration: 3600
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockRequest = {
      params: { userId: mockAnalytics.userId, event: 'test_event' },
      query: {},
      body: {},
      path: '/test',
      method: 'GET'
    };

    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    mockNext = jest.fn();

    // Reset all mocks
    jest.clearAllMocks();

    // Setup AnalyticsService mock implementations
    (AnalyticsService as jest.MockedClass<typeof AnalyticsService>).prototype.trackEvent.mockResolvedValue(mockAnalytics as Analytics);
    (AnalyticsService as jest.MockedClass<typeof AnalyticsService>).prototype.getUserAnalytics.mockResolvedValue([mockAnalytics as Analytics]);
    (AnalyticsService as jest.MockedClass<typeof AnalyticsService>).prototype.getEventAnalytics.mockResolvedValue([mockAnalytics as Analytics]);
    (AnalyticsService as jest.MockedClass<typeof AnalyticsService>).prototype.getMetricsSummary.mockResolvedValue({
      totalEvents: 100,
      uniqueUsers: 50,
      eventTypes: { USER_ACTION: 60, ACHIEVEMENT: 40 },
      categories: { ENGAGEMENT: 70, PROGRESSION: 30 }
    });
    (AnalyticsService as jest.MockedClass<typeof AnalyticsService>).prototype.getAggregatedMetrics.mockResolvedValue([
      { timestamp: new Date(), value: 100 },
      { timestamp: new Date(), value: 200 }
    ]);
    (AnalyticsService as jest.MockedClass<typeof AnalyticsService>).prototype.getUserEngagementMetrics.mockResolvedValue({
      totalEvents: 50,
      eventsByType: { USER_ACTION: 30, ACHIEVEMENT: 20 },
      averageSessionDuration: 1800,
      lastActive: new Date()
    });
    (AnalyticsService as jest.MockedClass<typeof AnalyticsService>).prototype.getSystemMetrics.mockResolvedValue({
      totalEvents: 1000,
      errorRate: 0.01,
      averageResponseTime: 100,
      activeUsers: 500
    });
  });

  describe('trackEvent', () => {
    it('should track event successfully', async () => {
      const eventData = {
        userId: 'test-user-id',
        type: AnalyticsType.USER_ACTION,
        category: AnalyticsCategory.ENGAGEMENT,
        event: 'test_event',
        data: {
          value: 100,
          metadata: { action: 'test' }
        },
        metrics: {
          duration: 1000,
          count: 1
        }
      };
      mockRequest.body = eventData;

      await controller.trackEvent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AnalyticsService.prototype.trackEvent).toHaveBeenCalledWith(eventData);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAnalytics,
        message: 'Event tracked successfully'
      });
    });

    it('should validate required fields', async () => {
      mockRequest.body = { event: 'test' }; // Missing required fields

      await controller.trackEvent(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('getUserAnalytics', () => {
    it('should get user analytics successfully', async () => {
      const timeRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      };
      mockRequest.query = {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      };

      await controller.getUserAnalytics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AnalyticsService.prototype.getUserAnalytics).toHaveBeenCalledWith(
        mockRequest.params.userId,
        timeRange
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockAnalytics]
      });
    });
  });

  describe('getEventAnalytics', () => {
    it('should get event analytics successfully', async () => {
      const timeRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      };
      mockRequest.query = {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      };

      await controller.getEventAnalytics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AnalyticsService.prototype.getEventAnalytics).toHaveBeenCalledWith(
        mockRequest.params.event,
        timeRange
      );
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: [mockAnalytics]
      });
    });
  });

  describe('getMetricsSummary', () => {
    it('should get metrics summary successfully', async () => {
      const timeRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      };
      mockRequest.query = {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      };

      await controller.getMetricsSummary(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AnalyticsService.prototype.getMetricsSummary).toHaveBeenCalledWith(timeRange);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalEvents: expect.any(Number),
          uniqueUsers: expect.any(Number),
          eventTypes: expect.any(Object),
          categories: expect.any(Object)
        })
      });
    });
  });

  describe('getAggregatedMetrics', () => {
    it('should get aggregated metrics successfully', async () => {
      mockRequest.query = {
        groupBy: 'hour',
        metric: 'value',
        start: new Date('2024-01-01').toISOString(),
        end: new Date('2024-12-31').toISOString()
      };

      await controller.getAggregatedMetrics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AnalyticsService.prototype.getAggregatedMetrics).toHaveBeenCalledWith({
        groupBy: 'hour',
        metric: 'value',
        timeRange: {
          start: expect.any(Date),
          end: expect.any(Date)
        }
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            timestamp: expect.any(Date),
            value: expect.any(Number)
          })
        ])
      });
    });

    it('should validate groupBy parameter', async () => {
      mockRequest.query = {
        groupBy: 'invalid',
        metric: 'value'
      };

      await controller.getAggregatedMetrics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
    });
  });

  describe('getUserEngagementMetrics', () => {
    it('should get user engagement metrics successfully', async () => {
      await controller.getUserEngagementMetrics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AnalyticsService.prototype.getUserEngagementMetrics).toHaveBeenCalledWith(mockRequest.params.userId);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalEvents: expect.any(Number),
          eventsByType: expect.any(Object),
          averageSessionDuration: expect.any(Number),
          lastActive: expect.any(Date)
        })
      });
    });
  });

  describe('getSystemMetrics', () => {
    it('should get system metrics successfully', async () => {
      const timeRange = {
        start: new Date('2024-01-01'),
        end: new Date('2024-12-31')
      };
      mockRequest.query = {
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString()
      };

      await controller.getSystemMetrics(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(AnalyticsService.prototype.getSystemMetrics).toHaveBeenCalledWith(timeRange);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          totalEvents: expect.any(Number),
          errorRate: expect.any(Number),
          averageResponseTime: expect.any(Number),
          activeUsers: expect.any(Number)
        })
      });
    });
  });
}); 