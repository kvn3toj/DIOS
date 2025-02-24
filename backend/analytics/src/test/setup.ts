import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

// Mock implementations
jest.mock('@sentry/node', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  startTransaction: jest.fn(() => ({
    finish: jest.fn(),
    setMeasurement: jest.fn(),
  })),
}));

// Global test utilities
global.createTestingModule = async (imports: any[] = [], providers: any[] = []) => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        envFilePath: '.env.test',
      }),
      TypeOrmModule.forRoot({
        type: 'sqlite',
        database: ':memory:',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
      WinstonModule.forRoot({
        transports: [
          new winston.transports.Console({
            level: 'none',
          }),
        ],
      }),
      ...imports,
    ],
    providers: [...providers],
  }).compile();

  return module;
};

// Global test data generators
global.createMockAnalytics = (overrides = {}) => ({
  type: 'USER',
  category: 'ACTION',
  event: 'test_event',
  userId: '123e4567-e89b-12d3-a456-426614174000',
  source: 'test',
  platform: 'web',
  version: '1.0.0',
  data: {},
  metrics: {
    value: 1,
    count: 1,
    duration: 1000,
  },
  session: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    startTime: new Date(),
    duration: 1000,
  },
  timestamp: new Date().toISOString(),
  ...overrides,
});

// Global test cleanup
afterEach(() => {
  jest.clearAllMocks();
});

// Type declarations for global utilities
declare global {
  namespace NodeJS {
    interface Global {
      createTestingModule: typeof createTestingModule;
      createMockAnalytics: typeof createMockAnalytics;
    }
  }
} 