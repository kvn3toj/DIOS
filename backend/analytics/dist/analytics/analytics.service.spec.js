"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const typeorm_1 = require("@nestjs/typeorm");
const analytics_service_1 = require("./analytics.service");
const analytics_entity_1 = require("./entities/analytics.entity");
const real_time_analytics_service_1 = require("./services/real-time-analytics.service");
const batch_analytics_service_1 = require("./services/batch-analytics.service");
const aggregation_service_1 = require("./services/aggregation.service");
describe('AnalyticsService', () => {
    let service;
    let repository;
    let messageQueue;
    let realTimeAnalytics;
    let batchAnalytics;
    let aggregationService;
    const mockRepository = {
        create: jest.fn(),
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        createQueryBuilder: jest.fn()
    };
    const mockMessageQueue = {
        emit: jest.fn()
    };
    const mockRealTimeAnalytics = {
        processEvent: jest.fn()
    };
    const mockBatchAnalytics = {
        processEvent: jest.fn()
    };
    const mockAggregationService = {
        aggregateMetrics: jest.fn(),
        generateSummary: jest.fn(),
        generateReport: jest.fn()
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                analytics_service_1.AnalyticsService,
                {
                    provide: (0, typeorm_1.getRepositoryToken)(analytics_entity_1.AnalyticsEntity),
                    useValue: mockRepository
                },
                {
                    provide: 'RABBITMQ_SERVICE',
                    useValue: mockMessageQueue
                },
                {
                    provide: real_time_analytics_service_1.RealTimeAnalyticsService,
                    useValue: mockRealTimeAnalytics
                },
                {
                    provide: batch_analytics_service_1.BatchAnalyticsService,
                    useValue: mockBatchAnalytics
                },
                {
                    provide: aggregation_service_1.AggregationService,
                    useValue: mockAggregationService
                }
            ]
        }).compile();
        service = module.get(analytics_service_1.AnalyticsService);
        repository = module.get((0, typeorm_1.getRepositoryToken)(analytics_entity_1.AnalyticsEntity));
        messageQueue = module.get('RABBITMQ_SERVICE');
        realTimeAnalytics = module.get(real_time_analytics_service_1.RealTimeAnalyticsService);
        batchAnalytics = module.get(batch_analytics_service_1.BatchAnalyticsService);
        aggregationService = module.get(aggregation_service_1.AggregationService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('trackEvent', () => {
        const mockEvent = {
            type: analytics_entity_1.AnalyticsType.USER,
            category: analytics_entity_1.AnalyticsCategory.ACTION,
            event: 'test_event',
            userId: 'test-user',
            data: { test: 'data' }
        };
        it('should create and save an analytics event', async () => {
            const savedEvent = { ...mockEvent, id: 'test-id' };
            mockRepository.create.mockReturnValue(mockEvent);
            mockRepository.save.mockResolvedValue(savedEvent);
            const result = await service.trackEvent(mockEvent);
            expect(mockRepository.create).toHaveBeenCalledWith(mockEvent);
            expect(mockRepository.save).toHaveBeenCalledWith(mockEvent);
            expect(mockMessageQueue.emit).toHaveBeenCalledWith('analytics.event', savedEvent);
            expect(mockRealTimeAnalytics.processEvent).toHaveBeenCalledWith(savedEvent);
            expect(mockBatchAnalytics.processEvent).toHaveBeenCalledWith(savedEvent);
            expect(result).toEqual(savedEvent);
        });
    });
    describe('findByTimeRange', () => {
        const mockTimeRange = {
            startTime: new Date('2024-01-01'),
            endTime: new Date('2024-01-02')
        };
        it('should find analytics events within time range with filters', async () => {
            const mockEvents = [{ id: 'test-id' }];
            mockRepository.find.mockResolvedValue(mockEvents);
            const result = await service.findByTimeRange(mockTimeRange.startTime, mockTimeRange.endTime, { type: analytics_entity_1.AnalyticsType.USER });
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: {
                    timestamp: {
                        $gte: mockTimeRange.startTime,
                        $lte: mockTimeRange.endTime
                    },
                    type: analytics_entity_1.AnalyticsType.USER
                },
                order: { timestamp: 'DESC' }
            });
            expect(result).toEqual(mockEvents);
        });
    });
    describe('getAggregatedMetrics', () => {
        const mockOptions = {
            groupBy: 'day',
            timeRange: {
                start: new Date('2024-01-01'),
                end: new Date('2024-01-02')
            },
            type: analytics_entity_1.AnalyticsType.USER
        };
        it('should return aggregated metrics', async () => {
            const mockMetrics = [{ date: '2024-01-01', count: 10 }];
            mockAggregationService.aggregateMetrics.mockResolvedValue(mockMetrics);
            const result = await service.getAggregatedMetrics(mockOptions);
            expect(mockAggregationService.aggregateMetrics).toHaveBeenCalledWith(mockOptions);
            expect(result).toEqual(mockMetrics);
        });
    });
    describe('getUserAnalytics', () => {
        const userId = 'test-user';
        const timeRange = {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-02')
        };
        it('should return user analytics within time range', async () => {
            const mockEvents = [{ id: 'test-id', userId }];
            mockRepository.find.mockResolvedValue(mockEvents);
            const result = await service.getUserAnalytics(userId, timeRange);
            expect(mockRepository.find).toHaveBeenCalledWith({
                where: {
                    userId,
                    timestamp: {
                        $gte: timeRange.start,
                        $lte: timeRange.end
                    }
                },
                order: { timestamp: 'DESC' }
            });
            expect(result).toEqual(mockEvents);
        });
    });
    describe('getMetricsSummary', () => {
        const timeRange = {
            start: new Date('2024-01-01'),
            end: new Date('2024-01-02')
        };
        it('should return metrics summary', async () => {
            const mockSummary = {
                totalEvents: 100,
                uniqueUsers: 50
            };
            mockAggregationService.generateSummary.mockResolvedValue(mockSummary);
            const result = await service.getMetricsSummary(timeRange);
            expect(mockAggregationService.generateSummary).toHaveBeenCalledWith(timeRange);
            expect(result).toEqual(mockSummary);
        });
    });
    describe('generateReport', () => {
        const mockOptions = {
            timeRange: {
                start: new Date('2024-01-01'),
                end: new Date('2024-01-02')
            },
            type: analytics_entity_1.AnalyticsType.USER,
            groupBy: 'day'
        };
        it('should generate analytics report', async () => {
            const mockReport = {
                summary: { totalEvents: 100 },
                data: [{ date: '2024-01-01', count: 50 }]
            };
            mockAggregationService.generateReport.mockResolvedValue(mockReport);
            const result = await service.generateReport(mockOptions);
            expect(mockAggregationService.generateReport).toHaveBeenCalledWith(mockOptions);
            expect(result).toEqual(mockReport);
        });
    });
});
//# sourceMappingURL=analytics.service.spec.js.map