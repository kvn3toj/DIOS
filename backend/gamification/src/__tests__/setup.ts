import { AppDataSource } from '../config/database';
import { eventBus } from '../config/eventBus';
import { gateway } from '../config/gateway';
import { logger } from '../utils/logger';

// Mock Redis client
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    lpush: jest.fn(),
    lrange: jest.fn(),
    keys: jest.fn(),
    quit: jest.fn()
  }));
});

// Mock RabbitMQ client
jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertExchange: jest.fn(),
      assertQueue: jest.fn(),
      bindQueue: jest.fn(),
      publish: jest.fn(),
      consume: jest.fn(),
      ack: jest.fn(),
      reject: jest.fn(),
      close: jest.fn()
    }),
    close: jest.fn()
  })
}));

// Mock Kong Gateway client
jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: {} }),
  get: jest.fn().mockResolvedValue({ status: 200 }),
  patch: jest.fn().mockResolvedValue({ data: {} })
}));

// Suppress logging during tests
logger.setLevel('error');

// Global test setup
beforeAll(async () => {
  // Initialize test database
  await AppDataSource.initialize();
});

// Reset database and mocks before each test
beforeEach(async () => {
  // Clear all tables
  const entities = AppDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = AppDataSource.getRepository(entity.name);
    await repository.clear();
  }

  // Clear all mocks
  jest.clearAllMocks();
});

// Cleanup after all tests
afterAll(async () => {
  // Close database connection
  await AppDataSource.destroy();

  // Close event bus connections
  await eventBus.close();
});

// Global test utilities
global.createTestUser = async (data = {}) => {
  const userRepository = AppDataSource.getRepository('User');
  return await userRepository.save({
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    ...data
  });
};

global.createTestAchievement = async (data = {}) => {
  const achievementRepository = AppDataSource.getRepository('Achievement');
  return await achievementRepository.save({
    name: 'Test Achievement',
    description: 'Test Description',
    points: 100,
    criteria: 'Test Criteria',
    category: 'Test Category',
    ...data
  });
};

global.createTestQuest = async (data = {}) => {
  const questRepository = AppDataSource.getRepository('Quest');
  return await questRepository.save({
    name: 'Test Quest',
    description: 'Test Description',
    experienceReward: 100,
    pointsReward: 50,
    objectives: [],
    ...data
  });
};

// Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
}); 