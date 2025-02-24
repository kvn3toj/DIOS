# API Gateway Guide

## Overview
The SuperApp and Gamifier 2.0 system uses Kong Gateway Enterprise for API management, providing features like rate limiting, authentication, analytics, and service discovery.

## Gateway Architecture

### Core Components
```typescript
interface GatewayConfig {
  services: {
    gamification: {
      name: string;
      url: string;
      routes: Route[];
      plugins: Plugin[];
    };
    social: {
      name: string;
      url: string;
      routes: Route[];
      plugins: Plugin[];
    };
    analytics: {
      name: string;
      url: string;
      routes: Route[];
      plugins: Plugin[];
    };
  };
  security: {
    authentication: AuthConfig;
    rateLimit: RateLimitConfig;
    cors: CorsConfig;
  };
  monitoring: {
    prometheus: PrometheusConfig;
    logging: LoggingConfig;
    tracing: TracingConfig;
  };
}

interface Route {
  name: string;
  paths: string[];
  methods: string[];
  protocols: string[];
  stripPath?: boolean;
  preserveHost?: boolean;
  tags?: string[];
}

interface Plugin {
  name: string;
  config: Record<string, any>;
  enabled: boolean;
  protocols: string[];
}
```

### Service Configuration
```typescript
interface ServiceConfig {
  upstream: {
    name: string;
    algorithm: 'round-robin' | 'consistent-hashing' | 'least-connections';
    healthchecks: {
      active: {
        type: 'http' | 'tcp' | 'grpc';
        interval: number;
        timeout: number;
        healthy: HealthyConfig;
        unhealthy: UnhealthyConfig;
      };
      passive: {
        type: 'http' | 'tcp' | 'grpc';
        healthy: HealthyConfig;
        unhealthy: UnhealthyConfig;
      };
    };
    targets: {
      target: string;
      weight: number;
      tags?: string[];
    }[];
  };
  routes: {
    name: string;
    paths: string[];
    methods: string[];
    protocols: string[];
    plugins: Plugin[];
  }[];
}
```

## Security Features

### Authentication
```typescript
interface AuthConfig {
  jwt: {
    enabled: boolean;
    secret: string;
    key_claim_name: string;
    claims_to_verify: string[];
    header_names: string[];
  };
  oauth2: {
    enabled: boolean;
    scopes: string[];
    mandatory_scope: boolean;
    token_expiration: number;
    provision_key: string;
    enable_authorization_code: boolean;
    enable_client_credentials: boolean;
    enable_password_grant: boolean;
  };
  key_auth: {
    enabled: boolean;
    key_names: string[];
    hide_credentials: boolean;
    key_in_body: boolean;
  };
}

// Example configuration
const authConfig: AuthConfig = {
  jwt: {
    enabled: true,
    secret: process.env.JWT_SECRET,
    key_claim_name: 'kid',
    claims_to_verify: ['exp', 'nbf'],
    header_names: ['Authorization'],
  },
  oauth2: {
    enabled: true,
    scopes: ['read', 'write', 'admin'],
    mandatory_scope: true,
    token_expiration: 7200,
    provision_key: process.env.OAUTH_PROVISION_KEY,
    enable_authorization_code: true,
    enable_client_credentials: true,
    enable_password_grant: false,
  },
  key_auth: {
    enabled: true,
    key_names: ['apikey', 'x-api-key'],
    hide_credentials: true,
    key_in_body: false,
  },
};
```

### Rate Limiting
```typescript
interface RateLimitConfig {
  second?: number;
  minute?: number;
  hour?: number;
  day?: number;
  month?: number;
  year?: number;
  limit_by: 'consumer' | 'credential' | 'ip';
  policy: 'local' | 'redis' | 'cluster';
  fault_tolerant: boolean;
  hide_client_headers: boolean;
  redis: {
    host: string;
    port: number;
    password?: string;
    database: number;
    timeout: number;
  };
}

// Example configuration
const rateLimitConfig: RateLimitConfig = {
  second: 10,
  minute: 100,
  hour: 1000,
  limit_by: 'consumer',
  policy: 'redis',
  fault_tolerant: true,
  hide_client_headers: false,
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
    password: process.env.REDIS_PASSWORD,
    database: 0,
    timeout: 2000,
  },
};
```

## Monitoring and Analytics

### Prometheus Integration
```typescript
interface PrometheusConfig {
  metrics: {
    enabled: boolean;
    port: number;
    path: string;
  };
  collect: {
    http: boolean;
    latency: boolean;
    bandwidth: boolean;
    database: boolean;
    memory: boolean;
  };
  labels: {
    service: string[];
    route: string[];
    workspace: string[];
  };
}

// Example configuration
const prometheusConfig: PrometheusConfig = {
  metrics: {
    enabled: true,
    port: 9542,
    path: '/metrics',
  },
  collect: {
    http: true,
    latency: true,
    bandwidth: true,
    database: true,
    memory: true,
  },
  labels: {
    service: ['name', 'version'],
    route: ['method', 'path'],
    workspace: ['name'],
  },
};
```

### Logging
```typescript
interface LoggingConfig {
  http: {
    enabled: boolean;
    format: string;
    custom_fields_by_lua: Record<string, string>;
  };
  tcp: {
    enabled: boolean;
    host: string;
    port: number;
    timeout: number;
  };
  udp: {
    enabled: boolean;
    host: string;
    port: number;
  };
  retry: {
    max_attempts: number;
    delay: number;
  };
}
```

## Service Discovery

### DNS Resolution
```typescript
interface DnsConfig {
  nameservers: string[];
  order: string[];
  valid_ttl: number;
  negative_ttl: number;
  no_sync: boolean;
  timeout: number;
  retrans: number;
}

// Example configuration
const dnsConfig: DnsConfig = {
  nameservers: ['10.0.0.1:53', '10.0.0.2:53'],
  order: ['LAST', 'SRV', 'A', 'CNAME'],
  valid_ttl: 300,
  negative_ttl: 30,
  no_sync: false,
  timeout: 2000,
  retrans: 5,
};
```

## Configuration Examples

### Development Environment
```yaml
# kong.dev.yml
_format_version: "2.1"
_transform: true

services:
  - name: gamification
    url: http://localhost:3000
    routes:
      - name: gamification-api
        paths:
          - /api/v1/gamification
    plugins:
      - name: rate-limiting
        config:
          minute: 60
          policy: local
      - name: key-auth
        config:
          key_names: ["apikey"]

  - name: social
    url: http://localhost:3001
    routes:
      - name: social-api
        paths:
          - /api/v1/social
    plugins:
      - name: cors
        config:
          origins: ["*"]
          methods: ["GET", "POST", "PUT", "DELETE"]
      - name: jwt
        config:
          secret_is_base64: false
          claims_to_verify: ["exp"]
```

### Production Environment
```yaml
# kong.prod.yml
_format_version: "2.1"
_transform: true

services:
  - name: gamification
    url: http://gamification-service:3000
    routes:
      - name: gamification-api
        paths:
          - /api/v1/gamification
    plugins:
      - name: rate-limiting
        config:
          minute: 1000
          policy: redis
      - name: key-auth
        config:
          key_names: ["x-api-key"]
          hide_credentials: true

  - name: social
    url: http://social-service:3001
    routes:
      - name: social-api
        paths:
          - /api/v1/social
    plugins:
      - name: cors
        config:
          origins: ["https://app.superapp.com"]
          methods: ["GET", "POST", "PUT", "DELETE"]
          credentials: true
      - name: jwt
        config:
          secret_is_base64: true
          claims_to_verify: ["exp", "nbf"]
```

## Related Guides
- [Core Architecture](architecture.md)
- [Security](../security/overview.md)
- [Service Discovery](../infrastructure/service-discovery.md)
- [Monitoring](../infrastructure/monitoring.md) 