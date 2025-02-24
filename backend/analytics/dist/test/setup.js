"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const nest_winston_1 = require("nest-winston");
const winston = require("winston");
jest.mock('@sentry/node', () => ({
    init: jest.fn(),
    captureException: jest.fn(),
    captureMessage: jest.fn(),
    startTransaction: jest.fn(() => ({
        finish: jest.fn(),
        setMeasurement: jest.fn(),
    })),
}));
global.createTestingModule = async (imports = [], providers = []) => {
    const module = await testing_1.Test.createTestingModule({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env.test',
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqlite',
                database: ':memory:',
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                synchronize: true,
            }),
            nest_winston_1.WinstonModule.forRoot({
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
afterEach(() => {
    jest.clearAllMocks();
});
//# sourceMappingURL=setup.js.map