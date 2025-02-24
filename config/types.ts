export interface Config {
  app: {
    env: string;
    port: number;
    apiVersion: string;
    corsOrigin: string;
  };

  database: {
    url: string;
    pool: {
      min: number;
      max: number;
    };
  };

  redis: {
    url: string;
    password?: string;
    db: number;
  };

  rabbitmq: {
    url: string;
    user: string;
    password: string;
    vhost: string;
  };

  jwt: {
    secret: string;
    expiresIn: string;
  };

  monitoring: {
    sentryDsn?: string;
    newRelicKey?: string;
    datadogApiKey?: string;
  };

  gateway: {
    adminUrl: string;
    proxyUrl: string;
  };

  graphql: {
    path: string;
    apolloKey?: string;
    apolloGraphRef?: string;
  };

  logging: {
    level: string;
    format: 'json' | 'pretty';
  };

  performance: {
    cacheTTL: number;
    rateLimit: {
      window: number;
      max: number;
    };
  };

  features: {
    enableWebsockets: boolean;
    enableAnalytics: boolean;
    enableRealTimeUpdates: boolean;
  };
} 