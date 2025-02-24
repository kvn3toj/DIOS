import { Config } from '../types';

const config: Config = {
  app: {
    env: 'production',
    port: parseInt(process.env.PORT || '3000', 10),
    apiVersion: process.env.API_VERSION || 'v1',
    corsOrigin: process.env.CORS_ORIGIN || 'https://gamification-service.com'
  },
  
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: parseInt(process.env.DATABASE_POOL_MIN || '5', 10),
      max: parseInt(process.env.DATABASE_POOL_MAX || '20', 10)
    }
  },
  
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10)
  },
  
  rabbitmq: {
    url: process.env.RABBITMQ_URL,
    user: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
    vhost: process.env.RABBITMQ_VHOST || '/'
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  
  monitoring: {
    sentryDsn: process.env.SENTRY_DSN,
    newRelicKey: process.env.NEW_RELIC_LICENSE_KEY,
    datadogApiKey: process.env.DATADOG_API_KEY
  },
  
  gateway: {
    adminUrl: process.env.KONG_ADMIN_URL,
    proxyUrl: process.env.KONG_PROXY_URL
  },
  
  graphql: {
    path: process.env.GRAPHQL_PATH || '/graphql',
    apolloKey: process.env.APOLLO_KEY,
    apolloGraphRef: process.env.APOLLO_GRAPH_REF
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json'
  },
  
  performance: {
    cacheTTL: parseInt(process.env.CACHE_TTL || '300', 10),
    rateLimit: {
      window: parseInt(process.env.RATE_LIMIT_WINDOW || '900', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || '1000', 10)
    }
  },
  
  features: {
    enableWebsockets: process.env.ENABLE_WEBSOCKETS === 'true',
    enableAnalytics: process.env.ENABLE_ANALYTICS !== 'false',
    enableRealTimeUpdates: process.env.ENABLE_REAL_TIME_UPDATES === 'true'
  }
};

export default config; 