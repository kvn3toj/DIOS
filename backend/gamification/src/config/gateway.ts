import axios from 'axios';
import { logger } from '../utils/logger';

interface GatewayConfig {
  adminUrl: string;
  serviceHost: string;
  servicePort: number;
  serviceName: string;
  serviceProtocol: 'http' | 'https';
  rateLimiting: {
    enabled: boolean;
    perSecond: number;
    perMinute: number;
    perHour: number;
  };
  auth: {
    enabled: boolean;
    type: 'jwt' | 'key-auth' | 'oauth2';
    config: Record<string, any>;
  };
  analytics: {
    enabled: boolean;
    detailedMetrics: boolean;
    retentionDays: number;
  };
}

class GatewayService {
  private config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
  }

  async registerService(): Promise<void> {
    try {
      // Register service with Kong
      await axios.post(`${this.config.adminUrl}/services`, {
        name: this.config.serviceName,
        host: this.config.serviceHost,
        port: this.config.servicePort,
        protocol: this.config.serviceProtocol
      });

      // Configure routes
      await axios.post(`${this.config.adminUrl}/services/${this.config.serviceName}/routes`, {
        paths: [`/${this.config.serviceName}`],
        strip_path: true
      });

      // Setup rate limiting if enabled
      if (this.config.rateLimiting.enabled) {
        await this.setupRateLimiting();
      }

      // Setup authentication if enabled
      if (this.config.auth.enabled) {
        await this.setupAuthentication();
      }

      // Setup analytics if enabled
      if (this.config.analytics.enabled) {
        await this.setupAnalytics();
      }

      logger.info(`Service ${this.config.serviceName} registered with API Gateway`);
    } catch (error) {
      logger.error('Failed to register service with API Gateway:', error);
      throw error;
    }
  }

  private async setupRateLimiting(): Promise<void> {
    try {
      await axios.post(`${this.config.adminUrl}/services/${this.config.serviceName}/plugins`, {
        name: 'rate-limiting',
        config: {
          second: this.config.rateLimiting.perSecond,
          minute: this.config.rateLimiting.perMinute,
          hour: this.config.rateLimiting.perHour,
          policy: 'local'
        }
      });

      logger.info('Rate limiting configured for service');
    } catch (error) {
      logger.error('Failed to setup rate limiting:', error);
      throw error;
    }
  }

  private async setupAuthentication(): Promise<void> {
    try {
      await axios.post(`${this.config.adminUrl}/services/${this.config.serviceName}/plugins`, {
        name: this.config.auth.type,
        config: this.config.auth.config
      });

      logger.info(`Authentication (${this.config.auth.type}) configured for service`);
    } catch (error) {
      logger.error('Failed to setup authentication:', error);
      throw error;
    }
  }

  private async setupAnalytics(): Promise<void> {
    try {
      await axios.post(`${this.config.adminUrl}/services/${this.config.serviceName}/plugins`, {
        name: 'prometheus',
        config: {
          status_codes: true,
          latency: true,
          bandwidth: true,
          upstream_health: true
        }
      });

      if (this.config.analytics.detailedMetrics) {
        await axios.post(`${this.config.adminUrl}/services/${this.config.serviceName}/plugins`, {
          name: 'datadog',
          config: {
            metrics: ['request_count', 'request_size', 'response_size', 'latency'],
            tags: ['service:gamification'],
            host: process.env.DATADOG_AGENT_HOST || 'localhost'
          }
        });
      }

      logger.info('Analytics configured for service');
    } catch (error) {
      logger.error('Failed to setup analytics:', error);
      throw error;
    }
  }

  async updateConfig(updates: Partial<GatewayConfig>): Promise<void> {
    try {
      // Update service configuration
      await axios.patch(`${this.config.adminUrl}/services/${this.config.serviceName}`, {
        host: updates.serviceHost || this.config.serviceHost,
        port: updates.servicePort || this.config.servicePort,
        protocol: updates.serviceProtocol || this.config.serviceProtocol
      });

      // Update plugins if necessary
      if (updates.rateLimiting) {
        await this.setupRateLimiting();
      }
      if (updates.auth) {
        await this.setupAuthentication();
      }
      if (updates.analytics) {
        await this.setupAnalytics();
      }

      // Update local config
      this.config = { ...this.config, ...updates };
      logger.info('Gateway configuration updated');
    } catch (error) {
      logger.error('Failed to update gateway configuration:', error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.config.adminUrl}/status`);
      return response.status === 200;
    } catch (error) {
      logger.error('Gateway health check failed:', error);
      return false;
    }
  }
}

// Create and export gateway instance
export const gateway = new GatewayService({
  adminUrl: process.env.KONG_ADMIN_URL || 'http://localhost:8001',
  serviceHost: process.env.SERVICE_HOST || 'localhost',
  servicePort: parseInt(process.env.SERVICE_PORT || '3000'),
  serviceName: 'gamification',
  serviceProtocol: 'http',
  rateLimiting: {
    enabled: true,
    perSecond: 10,
    perMinute: 100,
    perHour: 1000
  },
  auth: {
    enabled: true,
    type: 'jwt',
    config: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      key_claim_name: 'kid',
      claims_to_verify: ['exp']
    }
  },
  analytics: {
    enabled: true,
    detailedMetrics: true,
    retentionDays: 30
  }
}); 