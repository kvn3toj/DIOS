"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const analytics_controller_1 = require("./analytics.controller");
const analytics_service_1 = require("./analytics.service");
const analytics_entity_1 = require("./entities/analytics.entity");
describe('AnalyticsController', () => {
    let controller;
    let service;
    const mockAnalyticsService = {
        trackEvent: jest.fn(),
        findByTimeRange: jest.fn(),
        getUserAnalytics: jest.fn(),
        getEventAnalytics: jest.fn(),
        getAggregatedMetrics: jest.fn(),
        getMetricsSummary: jest.fn(),
        generateReport: jest.fn(),
        update: jest.fn(),
        remove: jest.fn()
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [analytics_controller_1.AnalyticsController],
            providers: [
                {
                    provide: analytics_service_1.AnalyticsService,
                    useValue: mockAnalyticsService
                }
            ]
        }).compile();
        controller = module.get(analytics_controller_1.AnalyticsController);
        service = module.get(analytics_service_1.AnalyticsService);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('trackEvent', () => {
        it('should track an analytics event', async () => {
            const createDto = {
                type: analytics_entity_1.AnalyticsType.USER,
                category: analytics_entity_1.AnalyticsCategory.ACTION,
                event: 'test_event',
                userId: 'test-user'
            };
            const expectedResult = { id: 'test-id', ...createDto };
            mockAnalyticsService.trackEvent.mockResolvedValue(expectedResult);
            const result = await controller.trackEvent(createDto);
            expect(service.trackEvent).toHaveBeenCalledWith(createDto);
            expect(result).toEqual(expectedResult);
        });
    });
    describe('findAll', () => {
        it('should return analytics events within time range', async () => {
            const startTime = '2024-01-01T00:00:00Z';
            const endTime = '2024-01-02T00:00:00Z';
            const type = analytics_entity_1.AnalyticsType.USER;
            const expectedEvents = [{ id: 'test-id' }];
            mockAnalyticsService.findByTimeRange.mockResolvedValue(expectedEvents);
            const result = await controller.findAll(startTime, endTime, type);
            expect(service.findByTimeRange).toHaveBeenCalledWith(new Date(startTime), new Date(endTime), { type });
            expect(result).toEqual(expectedEvents);
        });
    });
    describe('getUserAnalytics', () => {
        it('should return analytics for a specific user', async () => {
            const userId = 'test-user';
            const startTime = '2024-01-01T00:00:00Z';
            const endTime = '2024-01-02T00:00:00Z';
            const expectedEvents = [{ id: 'test-id', userId }];
            mockAnalyticsService.getUserAnalytics.mockResolvedValue(expectedEvents);
            const result = await controller.getUserAnalytics(userId, startTime, endTime);
            expect(service.getUserAnalytics).toHaveBeenCalledWith(userId, { start: new Date(startTime), end: new Date(endTime) });
            expect(result).toEqual(expectedEvents);
        });
    });
    describe('getEventAnalytics', () => {
        it('should return analytics for a specific event', async () => {
            const event = 'test_event';
            const startTime = '2024-01-01T00:00:00Z';
            const endTime = '2024-01-02T00:00:00Z';
            const expectedEvents = [{ id: 'test-id', event }];
            mockAnalyticsService.getEventAnalytics.mockResolvedValue(expectedEvents);
            const result = await controller.getEventAnalytics(event, startTime, endTime);
            expect(service.getEventAnalytics).toHaveBeenCalledWith(event, { start: new Date(startTime), end: new Date(endTime) });
            expect(result).toEqual(expectedEvents);
        });
    });
    describe('getAggregatedMetrics', () => {
        it('should return aggregated metrics', async () => {
            const groupBy = 'day';
            const startTime = '2024-01-01T00:00:00Z';
            const endTime = '2024-01-02T00:00:00Z';
            const type = analytics_entity_1.AnalyticsType.USER;
            const expectedMetrics = [{ date: '2024-01-01', count: 10 }];
            mockAnalyticsService.getAggregatedMetrics.mockResolvedValue(expectedMetrics);
            const result = await controller.getAggregatedMetrics(groupBy, startTime, endTime, type);
            expect(service.getAggregatedMetrics).toHaveBeenCalledWith({
                groupBy,
                timeRange: { start: new Date(startTime), end: new Date(endTime) },
                type
            });
            expect(result).toEqual(expectedMetrics);
        });
    });
    describe('getMetricsSummary', () => {
        it('should return metrics summary', async () => {
            const startTime = '2024-01-01T00:00:00Z';
            const endTime = '2024-01-02T00:00:00Z';
            const expectedSummary = { totalEvents: 100, uniqueUsers: 50 };
            mockAnalyticsService.getMetricsSummary.mockResolvedValue(expectedSummary);
            const result = await controller.getMetricsSummary(startTime, endTime);
            expect(service.getMetricsSummary).toHaveBeenCalledWith({
                start: new Date(startTime),
                end: new Date(endTime)
            });
            expect(result).toEqual(expectedSummary);
        });
    });
    describe('generateReport', () => {
        it('should generate analytics report', async () => {
            const startTime = '2024-01-01T00:00:00Z';
            const endTime = '2024-01-02T00:00:00Z';
            const type = analytics_entity_1.AnalyticsType.USER;
            const groupBy = 'day';
            const metrics = 'events,users';
            const expectedReport = {
                summary: { totalEvents: 100 },
                data: [{ date: '2024-01-01', count: 50 }]
            };
            mockAnalyticsService.generateReport.mockResolvedValue(expectedReport);
            const result = await controller.generateReport(startTime, endTime, type, groupBy, metrics);
            expect(service.generateReport).toHaveBeenCalledWith({
                timeRange: { start: new Date(startTime), end: new Date(endTime) },
                type,
                groupBy,
                metrics: metrics.split(',')
            });
            expect(result).toEqual(expectedReport);
        });
    });
    describe('update', () => {
        it('should update analytics event', async () => {
            const id = 'test-id';
            const updateDto = {
                event: 'updated_event'
            };
            const expectedResult = { id, ...updateDto };
            mockAnalyticsService.update.mockResolvedValue(expectedResult);
            const result = await controller.update(id, updateDto);
            expect(service.update).toHaveBeenCalledWith(id, updateDto);
            expect(result).toEqual(expectedResult);
        });
    });
    describe('remove', () => {
        it('should remove analytics event', async () => {
            const id = 'test-id';
            mockAnalyticsService.remove.mockResolvedValue(true);
            const result = await controller.remove(id);
            expect(service.remove).toHaveBeenCalledWith(id);
            expect(result).toBe(true);
        });
    });
});
//# sourceMappingURL=analytics.controller.spec.js.map