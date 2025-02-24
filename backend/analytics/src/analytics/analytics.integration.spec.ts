import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { AnalyticsEntity, AnalyticsType, AnalyticsCategory } from './entities/analytics.entity';
import { CreateAnalyticsDto } from './dto/create-analytics.dto';
import { UpdateAnalyticsDto } from './dto/update-analytics.dto';

describe('Analytics Integration Tests', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test'
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            entities: [AnalyticsEntity],
            synchronize: true
          }),
          inject: [ConfigService]
        }),
        AppModule
      ]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
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
      const createDto: CreateAnalyticsDto = {
        type: AnalyticsType.USER,
        category: AnalyticsCategory.ACTION,
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
          type: AnalyticsType.USER
        })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach(event => {
        expect(event).toHaveProperty('id');
        expect(event).toHaveProperty('type', AnalyticsType.USER);
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
          type: AnalyticsType.USER
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
          type: AnalyticsType.USER,
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
    let analyticsId: string;

    beforeEach(async () => {
      // Create a test analytics event
      const createDto: CreateAnalyticsDto = {
        type: AnalyticsType.USER,
        category: AnalyticsCategory.ACTION,
        event: 'test_event',
        userId: 'test-user'
      };

      const response = await request(app.getHttpServer())
        .post('/api/v1/analytics/track')
        .send(createDto);

      analyticsId = response.body.id;
    });

    it('should update an analytics event', async () => {
      const updateDto: UpdateAnalyticsDto = {
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
    let analyticsId: string;

    beforeEach(async () => {
      // Create a test analytics event
      const createDto: CreateAnalyticsDto = {
        type: AnalyticsType.USER,
        category: AnalyticsCategory.ACTION,
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

      // Verify the event was deleted
      await request(app.getHttpServer())
        .get(`/api/v1/analytics/${analyticsId}`)
        .expect(404);
    });
  });
}); 