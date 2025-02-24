# Testing Guide

## Table of Contents
1. [Testing Philosophy](#testing-philosophy)
2. [Test Environment Setup](#test-environment-setup)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [Performance Testing](#performance-testing)
6. [GraphQL Testing](#graphql-testing)
7. [Event System Testing](#event-system-testing)
8. [Test Data Management](#test-data-management)
9. [CI/CD Integration](#cicd-integration)

## Testing Philosophy

### Core Principles
- Test-Driven Development (TDD) when applicable
- Comprehensive test coverage (minimum 80%)
- Isolation of test cases
- Proper mocking and stubbing
- Clear test descriptions
- Fast and reliable test execution

### Test Pyramid
```
     E2E     
   Integration  
 Unit Tests    
```
- Unit Tests: 70% of test suite
- Integration Tests: 20% of test suite
- E2E Tests: 10% of test suite

## Test Environment Setup

### Prerequisites
```bash
# Install dependencies
pnpm install

# Setup test database
docker-compose up -d test-db

# Configure environment
cp .env.test.example .env.test
```

### Jest Configuration
```typescript
// jest.config.ts
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

## Unit Testing

### Service Tests
```typescript
describe('AchievementService', () => {
  let service: AchievementService;
  let mockRepository: jest.Mocked<AchievementRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn()
    } as any;
    service = new AchievementService(mockRepository);
  });

  describe('createAchievement', () => {
    it('should create achievement successfully', async () => {
      const data = {
        name: 'Test Achievement',
        points: 100
      };
      mockRepository.create.mockResolvedValue({ ...data, id: '1' });
      
      const result = await service.createAchievement(data);
      
      expect(result).toMatchObject(data);
      expect(mockRepository.create).toHaveBeenCalledWith(data);
    });
  });
});
```

### Repository Tests
```typescript
describe('AchievementRepository', () => {
  let repository: AchievementRepository;
  let connection: Connection;

  beforeAll(async () => {
    connection = await createTestConnection();
    repository = connection.getCustomRepository(AchievementRepository);
  });

  afterAll(async () => {
    await connection.close();
  });

  beforeEach(async () => {
    await connection.synchronize(true);
  });

  it('should find achievement by id', async () => {
    const achievement = await repository.create({
      name: 'Test Achievement',
      points: 100
    });

    const found = await repository.findById(achievement.id);
    expect(found).toMatchObject(achievement);
  });
});
```

### Controller Tests
```typescript
describe('AchievementController', () => {
  let controller: AchievementController;
  let mockService: jest.Mocked<AchievementService>;

  beforeEach(() => {
    mockService = {
      createAchievement: jest.fn(),
      getAchievement: jest.fn()
    } as any;
    controller = new AchievementController(mockService);
  });

  describe('createAchievement', () => {
    it('should create achievement and return 201', async () => {
      const req = mockRequest({
        body: { name: 'Test Achievement', points: 100 }
      });
      const res = mockResponse();

      await controller.createAchievement(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockService.createAchievement).toHaveBeenCalledWith(req.body);
    });
  });
});
```

## Integration Testing

### API Endpoint Tests
```typescript
describe('Achievement API', () => {
  let app: Express;
  let token: string;

  beforeAll(async () => {
    app = await createTestApp();
    token = await generateTestToken();
  });

  describe('POST /achievements', () => {
    it('should create achievement', async () => {
      const response = await request(app)
        .post('/api/v1/achievements')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Achievement',
          points: 100
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
    });
  });
});
```

### GraphQL Tests
```typescript
describe('Achievement Resolver', () => {
  let server: ApolloServer;

  beforeAll(async () => {
    server = await createTestServer();
  });

  it('should query achievement', async () => {
    const result = await server.executeOperation({
      query: gql`
        query GetAchievement($id: ID!) {
          achievement(id: $id) {
            id
            name
            points
          }
        }
      `,
      variables: { id: 'test-id' }
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.achievement).toBeDefined();
  });
});
```

## Performance Testing

### Load Testing Configuration
```typescript
export const LOAD_TEST_CONFIG = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 50 },
    { duration: '1m', target: 0 }
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01']
  }
};
```

### Running Performance Tests
```bash
# Load testing
k6 run tests/performance/load-test.ts

# Stress testing
k6 run tests/performance/stress-test.ts

# Scalability testing
k6 run tests/performance/scalability-test.ts
```

## Event System Testing

### Event Bus Tests
```typescript
describe('EventBus', () => {
  let eventBus: EventBus;

  beforeAll(async () => {
    eventBus = await createTestEventBus();
  });

  afterAll(async () => {
    await eventBus.close();
  });

  it('should publish and consume events', async () => {
    const message = { type: 'test', data: { value: 1 } };
    const received = jest.fn();

    await eventBus.subscribe('test.*', received);
    await eventBus.publish('test.event', message);

    expect(received).toHaveBeenCalledWith(message);
  });
});
```

## Test Data Management

### Test Data Factories
```typescript
export const createTestUser = (overrides = {}) => ({
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  ...overrides
});

export const createTestAchievement = (overrides = {}) => ({
  name: 'Test Achievement',
  description: 'Test Description',
  points: 100,
  ...overrides
});
```

### Database Seeding
```typescript
async function seedTestData() {
  const connection = await createTestConnection();
  
  try {
    await connection.synchronize(true);
    await seedUsers();
    await seedAchievements();
    await seedQuests();
  } finally {
    await connection.close();
  }
}
```

## CI/CD Integration

### GitHub Actions Configuration
```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v2
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    - name: Install dependencies
      run: pnpm install
    - name: Run tests
      run: pnpm test
    - name: Upload coverage
      uses: codecov/codecov-action@v2
```

### Test Scripts
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "jest --config jest.e2e.config.ts",
    "test:perf": "k6 run tests/performance/**/*.ts"
  }
}
```

## Best Practices

### Writing Tests
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)
- One assertion per test
- Keep tests focused and simple
- Use proper setup and teardown
- Mock external dependencies
- Handle asynchronous operations properly

### Test Organization
- Group related tests
- Use proper describe blocks
- Maintain test isolation
- Clean up test data
- Use shared test utilities
- Keep test files close to source files

### Debugging Tests
- Use proper logging
- Leverage Jest's debugging capabilities
- Inspect test coverage reports
- Use snapshot testing wisely
- Monitor test performance
- Handle flaky tests

## Common Patterns

### Mocking Services
```typescript
const mockService = {
  method: jest.fn().mockResolvedValue(result)
};
```

### Testing Error Handling
```typescript
it('should handle errors', async () => {
  const error = new Error('Test error');
  mockService.method.mockRejectedValue(error);
  
  await expect(async () => {
    await controller.method(req, res);
  }).rejects.toThrow(error);
});
```

### Testing Events
```typescript
it('should emit event', async () => {
  const spy = jest.spyOn(eventBus, 'publish');
  await service.method();
  expect(spy).toHaveBeenCalledWith('event.type', expect.any(Object));
}); 