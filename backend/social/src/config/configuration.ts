import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  // Server configuration
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Database configuration
  database: {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'social_service',
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
  },

  // Redis configuration
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
  },

  // RabbitMQ configuration
  rabbitmq: {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchange: process.env.RABBITMQ_EXCHANGE || 'social_events',
    queues: {
      profile: 'social.profile',
      connection: 'social.connection',
      activity: 'social.activity',
      notification: 'social.notification',
    },
  },

  // GraphQL configuration
  graphql: {
    playground: process.env.NODE_ENV !== 'production',
    debug: process.env.NODE_ENV !== 'production',
    autoSchemaFile: true,
    sortSchema: true,
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 10,
  },

  // Monitoring configuration
  monitoring: {
    enabled: process.env.MONITORING_ENABLED === 'true',
    metrics: {
      port: parseInt(process.env.METRICS_PORT, 10) || 9464,
      path: process.env.METRICS_PATH || '/metrics',
    },
  },

  // API Gateway configuration
  gateway: {
    url: process.env.GATEWAY_URL || 'http://localhost:8001',
    serviceName: 'social-service',
    serviceHost: process.env.SERVICE_HOST || 'localhost',
    servicePort: parseInt(process.env.PORT, 10) || 3001,
    serviceProtocol: process.env.SERVICE_PROTOCOL || 'http',
  },

  // WebSocket configuration
  websocket: {
    enabled: true,
    path: '/socket.io',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  },

  // CQRS configuration
  cqrs: {
    eventStore: {
      type: 'redis',
      ttl: parseInt(process.env.EVENT_STORE_TTL, 10) || 86400, // 24 hours
    },
  },
})); 