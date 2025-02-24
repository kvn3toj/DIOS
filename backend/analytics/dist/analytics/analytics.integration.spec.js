"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const request = require("supertest");
const app_module_1 = require("../app.module");
const analytics_entity_1 = require("./entities/analytics.entity");
describe('Analytics Integration Tests', () => {
    let app;
    let moduleRef;
    beforeAll(async () => {
        moduleRef = await testing_1.Test.createTestingModule({
            imports: [
                config_1.ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: '.env.test'
                }),
                typeorm_1.TypeOrmModule.forRootAsync({
                    imports: [config_1.ConfigModule],
                    useFactory: (configService) => ({
                        type: 'postgres',
                        host: configService.get('DB_HOST'),
                        port: configService.get('DB_PORT'),
                        username: configService.get('DB_USERNAME'),
                        password: configService.get('DB_PASSWORD'),
                        database: configService.get('DB_DATABASE'),
                        entities: [analytics_entity_1.AnalyticsEntity],
                        synchronize: true
                    }),
                    inject: [config_1.ConfigService]
                }),
                app_module_1.AppModule
            ]
        }).compile();
        app = moduleRef.createNestApplication();
        app.useGlobalPipes(new common_1.ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true
        }));
        await app.init();
    });
    afterAll(async () => {
        await moduleRef.close();
        await app.close();
    });
    describe('POST /analytics/track', () => {
        it('should create a new analytics event', async () => {
            const createDto = {
                type: analytics_entity_1.AnalyticsType.USER,
                category: analytics_entity_1.AnalyticsCategory.ACTION,
                event: 'test_event',
                userId: 'test-user',
                data: { test: 'data' }
            };
            const response = await request(app.getHttpServer())
                .post('/api/v1/analytics/track')
                .send(createDto)
                .expect(201);
            expect(response.body).toMatchObject({
                id: expect.any(String),
                ...createDto,
                timestamp: expect.any(String),
                createdAt: expect.any(String),
                updatedAt: expect.any(String)
            });
        });
        it('should validate required fields', async () => {
            const invalidDto = {
                type: 'INVALID_TYPE',
                category: 'INVALID_CATEGORY'
            };
            await request(app.getHttpServer())
                .post('/api/v1/analytics/track')
                .send(invalidDto)
                .expect(400);
        });
    });
    describe('GET /analytics', () => {
        it('should return analytics events within time range', async () => {
            const startTime = new Date();
            startTime.setHours(startTime.getHours() - 1);
            const endTime = new Date();
            const response = await request(app.getHttpServer())
                .get('/api/v1/analytics')
                .query({
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                type: analytics_entity_1.AnalyticsType.USER
            })
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(event => {
                expect(event).toHaveProperty('id');
                expect(event).toHaveProperty('type', analytics_entity_1.AnalyticsType.USER);
                expect(new Date(event.timestamp)).toBeInstanceOf(Date);
            });
        });
    });
    describe('GET /analytics/user/:userId', () => {
        it('should return analytics for a specific user', async () => {
            const userId = 'test-user';
            const startTime = new Date();
            startTime.setHours(startTime.getHours() - 24);
            const endTime = new Date();
            const response = await request(app.getHttpServer())
                .get(`/api/v1/analytics/user/${userId}`)
                .query({
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            })
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(event => {
                expect(event).toHaveProperty('userId', userId);
            });
        });
    });
    describe('GET /analytics/metrics/aggregated', () => {
        it('should return aggregated metrics', async () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() - 7);
            const endTime = new Date();
            const response = await request(app.getHttpServer())
                .get('/api/v1/analytics/metrics/aggregated')
                .query({
                groupBy: 'day',
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                type: analytics_entity_1.AnalyticsType.USER
            })
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            response.body.forEach(metric => {
                expect(metric).toHaveProperty('date');
                expect(metric).toHaveProperty('count');
            });
        });
    });
    describe('GET /analytics/metrics/summary', () => {
        it('should return metrics summary', async () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() - 30);
            const endTime = new Date();
            const response = await request(app.getHttpServer())
                .get('/api/v1/analytics/metrics/summary')
                .query({
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            })
                .expect(200);
            expect(response.body).toHaveProperty('totalEvents');
            expect(response.body).toHaveProperty('uniqueUsers');
        });
    });
    describe('GET /analytics/report', () => {
        it('should generate analytics report', async () => {
            const startTime = new Date();
            startTime.setDate(startTime.getDate() - 30);
            const endTime = new Date();
            const response = await request(app.getHttpServer())
                .get('/api/v1/analytics/report')
                .query({
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                type: analytics_entity_1.AnalyticsType.USER,
                groupBy: 'day',
                metrics: 'events,users'
            })
                .expect(200);
            expect(response.body).toHaveProperty('summary');
            expect(response.body).toHaveProperty('data');
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
    describe('PATCH /analytics/:id', () => {
        let analyticsId;
        beforeEach(async () => {
            const createDto = {
                type: analytics_entity_1.AnalyticsType.USER,
                category: analytics_entity_1.AnalyticsCategory.ACTION,
                event: 'test_event',
                userId: 'test-user'
            };
            const response = await request(app.getHttpServer())
                .post('/api/v1/analytics/track')
                .send(createDto);
            analyticsId = response.body.id;
        });
        it('should update an analytics event', async () => {
            const updateDto = {
                event: 'updated_event'
            };
            const response = await request(app.getHttpServer())
                .patch(`/api/v1/analytics/${analyticsId}`)
                .send(updateDto)
                .expect(200);
            expect(response.body).toMatchObject({
                id: analyticsId,
                event: updateDto.event
            });
        });
    });
    describe('DELETE /analytics/:id', () => {
        let analyticsId;
        beforeEach(async () => {
            const createDto = {
                type: analytics_entity_1.AnalyticsType.USER,
                category: analytics_entity_1.AnalyticsCategory.ACTION,
                event: 'test_event',
                userId: 'test-user'
            };
            const response = await request(app.getHttpServer())
                .post('/api/v1/analytics/track')
                .send(createDto);
            analyticsId = response.body.id;
        });
        it('should delete an analytics event', async () => {
            await request(app.getHttpServer())
                .delete(`/api/v1/analytics/${analyticsId}`)
                .expect(200);
            await request(app.getHttpServer())
                .get(`/api/v1/analytics/${analyticsId}`)
                .expect(404);
        });
    });
});
//# sourceMappingURL=analytics.integration.spec.js.map