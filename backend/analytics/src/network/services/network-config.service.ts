import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NetworkConfigService {
  private readonly logger = new Logger(NetworkConfigService.name);

  // Network configuration
  private readonly networkConfig = {
    http: {
      port: 3000,
      host: '0.0.0.0',
      cors: {
        enabled: true,
        origins: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true,
      },
      compression: {
        enabled: true,
        level: 6,
      },
      timeout: {
        read: 5000, // ms
        write: 5000, // ms
        idle: 10000, // ms
      },
    },
    websocket: {
      enabled: true,
      path: '/ws',
      maxConnections: 1000,
      heartbeat: {
        interval: 30000, // ms
        timeout: 60000, // ms
      },
    },
    loadBalancing: {
      enabled: true,
      algorithm: 'round-robin',
      healthCheck: {
        enabled: true,
        interval: 10000, // ms
        path: '/health',
        timeout: 2000, // ms
        unhealthyThreshold: 3,
        healthyThreshold: 2,
      },
      sticky: {
        enabled: true,
        cookieName: 'srv_id',
      },
    },
    security: {
      ssl: {
        enabled: true,
        cert: 'path/to/cert',
        key: 'path/to/key',
        minVersion: 'TLSv1.2',
      },
      ddos: {
        enabled: true,
        rateLimit: {
          windowMs: 15 * 60 * 1000, // 15 minutes
          max: 100, // limit each IP to 100 requests per windowMs
        },
        blacklist: [],
        whitelist: [],
      },
      headers: {
        hsts: {
          enabled: true,
          maxAge: 31536000, // 1 year
          includeSubDomains: true,
          preload: true,
        },
        xframe: 'SAMEORIGIN',
        xssProtection: '1; mode=block',
        nosniff: true,
      },
    },
    proxy: {
      enabled: false,
      trusted: ['127.0.0.1'],
      preserveHostHeader: true,
      timeout: 5000, // ms
    },
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeNetworkConfig();
  }

  private initializeNetworkConfig() {
    try {
      // Override defaults with environment variables
      this.loadEnvironmentConfig();
      
      // Validate network configuration
      this.validateNetworkConfig();
      
      // Emit network configuration loaded event
      this.eventEmitter.emit('network.config.loaded', {
        timestamp: new Date(),
        config: this.networkConfig,
      });

      this.logger.log('Network configuration initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize network configuration', error);
      throw error;
    }
  }

  private loadEnvironmentConfig() {
    // HTTP Configuration
    if (this.configService.get('HTTP_PORT')) {
      this.networkConfig.http.port = parseInt(this.configService.get('HTTP_PORT'), 10);
    }
    if (this.configService.get('HTTP_HOST')) {
      this.networkConfig.http.host = this.configService.get('HTTP_HOST');
    }

    // CORS Configuration
    if (this.configService.get('CORS_ORIGINS')) {
      this.networkConfig.http.cors.origins = this.configService.get('CORS_ORIGINS').split(',');
    }

    // WebSocket Configuration
    if (this.configService.get('WS_ENABLED')) {
      this.networkConfig.websocket.enabled = this.configService.get('WS_ENABLED') === 'true';
    }
    if (this.configService.get('WS_MAX_CONNECTIONS')) {
      this.networkConfig.websocket.maxConnections = parseInt(
        this.configService.get('WS_MAX_CONNECTIONS'),
        10,
      );
    }

    // Load Balancing Configuration
    if (this.configService.get('LB_ENABLED')) {
      this.networkConfig.loadBalancing.enabled = this.configService.get('LB_ENABLED') === 'true';
    }
    if (this.configService.get('LB_ALGORITHM')) {
      this.networkConfig.loadBalancing.algorithm = this.configService.get('LB_ALGORITHM');
    }

    // Security Configuration
    if (this.configService.get('SSL_ENABLED')) {
      this.networkConfig.security.ssl.enabled = this.configService.get('SSL_ENABLED') === 'true';
    }
    if (this.configService.get('SSL_CERT')) {
      this.networkConfig.security.ssl.cert = this.configService.get('SSL_CERT');
    }
    if (this.configService.get('SSL_KEY')) {
      this.networkConfig.security.ssl.key = this.configService.get('SSL_KEY');
    }
  }

  private validateNetworkConfig() {
    // Validate HTTP configuration
    if (this.networkConfig.http.port < 0 || this.networkConfig.http.port > 65535) {
      throw new Error('Invalid HTTP port number');
    }

    // Validate WebSocket configuration
    if (this.networkConfig.websocket.enabled) {
      if (this.networkConfig.websocket.maxConnections <= 0) {
        this.logger.warn('WebSocket max connections should be greater than 0');
      }
    }

    // Validate Load Balancing configuration
    if (this.networkConfig.loadBalancing.enabled) {
      if (!['round-robin', 'least-connections', 'ip-hash'].includes(this.networkConfig.loadBalancing.algorithm)) {
        throw new Error('Invalid load balancing algorithm');
      }
    }

    // Validate SSL configuration
    if (this.networkConfig.security.ssl.enabled) {
      if (!this.networkConfig.security.ssl.cert || !this.networkConfig.security.ssl.key) {
        throw new Error('SSL certificate and key are required when SSL is enabled');
      }
    }
  }

  // Public methods to access configuration
  getHttpConfig() {
    return { ...this.networkConfig.http };
  }

  getWebSocketConfig() {
    return { ...this.networkConfig.websocket };
  }

  getLoadBalancingConfig() {
    return { ...this.networkConfig.loadBalancing };
  }

  getSecurityConfig() {
    return { ...this.networkConfig.security };
  }

  getProxyConfig() {
    return { ...this.networkConfig.proxy };
  }

  updateHttpConfig(updates: Partial<typeof this.networkConfig.http>) {
    this.networkConfig.http = { ...this.networkConfig.http, ...updates };
    this.validateNetworkConfig();
    this.eventEmitter.emit('network.config.updated', { type: 'http', updates });
  }

  updateWebSocketConfig(updates: Partial<typeof this.networkConfig.websocket>) {
    this.networkConfig.websocket = { ...this.networkConfig.websocket, ...updates };
    this.validateNetworkConfig();
    this.eventEmitter.emit('network.config.updated', { type: 'websocket', updates });
  }

  updateLoadBalancingConfig(updates: Partial<typeof this.networkConfig.loadBalancing>) {
    this.networkConfig.loadBalancing = { ...this.networkConfig.loadBalancing, ...updates };
    this.validateNetworkConfig();
    this.eventEmitter.emit('network.config.updated', { type: 'loadBalancing', updates });
  }

  updateSecurityConfig(updates: Partial<typeof this.networkConfig.security>) {
    this.networkConfig.security = { ...this.networkConfig.security, ...updates };
    this.validateNetworkConfig();
    this.eventEmitter.emit('network.config.updated', { type: 'security', updates });
  }

  updateProxyConfig(updates: Partial<typeof this.networkConfig.proxy>) {
    this.networkConfig.proxy = { ...this.networkConfig.proxy, ...updates };
    this.validateNetworkConfig();
    this.eventEmitter.emit('network.config.updated', { type: 'proxy', updates });
  }
} 