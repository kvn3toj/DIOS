import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class SecurityConfigService {
  private readonly logger = new Logger(SecurityConfigService.name);

  // Authentication configuration
  private readonly authConfig = {
    jwt: {
      enabled: true,
      expiresIn: '24h',
      refreshExpiresIn: '7d',
      algorithm: 'HS256',
      issuer: 'superapp-gamifier',
      audience: ['web', 'mobile'],
    },
    mfa: {
      enabled: true,
      methods: ['totp', 'email'],
      totpWindow: 1,
      maxAttempts: 3,
      blockDuration: 300, // 5 minutes
    },
    passwordPolicy: {
      minLength: 12,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90, // days
      preventReuse: 5, // last 5 passwords
    },
  };

  // Authorization configuration
  private readonly authzConfig = {
    rbac: {
      enabled: true,
      superAdminRole: 'SUPER_ADMIN',
      defaultRole: 'USER',
      hierarchical: true,
    },
    permissions: {
      granular: true,
      wildcards: true,
      inheritance: true,
    },
    policies: {
      enforceAll: true,
      auditAll: true,
      maxCacheAge: 300, // 5 minutes
    },
  };

  // Data security configuration
  private readonly dataSecurityConfig = {
    encryption: {
      algorithm: 'AES-256-GCM',
      keyRotation: 30, // days
      saltRounds: 10,
    },
    pii: {
      fields: ['email', 'phone', 'address', 'socialSecurity'],
      encryption: true,
      masking: true,
      retention: 365, // days
    },
    audit: {
      enabled: true,
      retention: 90, // days
      detailedLogging: true,
    },
  };

  // Rate limiting configuration
  private readonly rateLimitConfig = {
    global: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    },
    auth: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 5, // limit each IP to 5 failed auth attempts per windowMs
    },
    api: {
      windowMs: 60 * 1000, // 1 minute
      max: 60, // limit each IP to 60 requests per windowMs
    },
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeSecurityConfig();
  }

  private initializeSecurityConfig() {
    try {
      // Override defaults with environment variables if provided
      this.loadEnvironmentConfig();
      
      // Validate security configuration
      this.validateSecurityConfig();
      
      // Emit security configuration loaded event
      this.eventEmitter.emit('security.config.loaded', {
        timestamp: new Date(),
        config: {
          auth: this.authConfig,
          authz: this.authzConfig,
          dataSecurity: this.dataSecurityConfig,
          rateLimit: this.rateLimitConfig,
        },
      });

      this.logger.log('Security configuration initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize security configuration', error);
      throw error;
    }
  }

  private loadEnvironmentConfig() {
    // JWT Configuration
    if (this.configService.get('JWT_EXPIRES_IN')) {
      this.authConfig.jwt.expiresIn = this.configService.get('JWT_EXPIRES_IN');
    }
    if (this.configService.get('JWT_REFRESH_EXPIRES_IN')) {
      this.authConfig.jwt.refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN');
    }

    // MFA Configuration
    if (this.configService.get('MFA_ENABLED')) {
      this.authConfig.mfa.enabled = this.configService.get('MFA_ENABLED') === 'true';
    }
    if (this.configService.get('MFA_MAX_ATTEMPTS')) {
      this.authConfig.mfa.maxAttempts = parseInt(this.configService.get('MFA_MAX_ATTEMPTS'), 10);
    }

    // Password Policy
    if (this.configService.get('PASSWORD_MIN_LENGTH')) {
      this.authConfig.passwordPolicy.minLength = parseInt(this.configService.get('PASSWORD_MIN_LENGTH'), 10);
    }
    if (this.configService.get('PASSWORD_MAX_AGE')) {
      this.authConfig.passwordPolicy.maxAge = parseInt(this.configService.get('PASSWORD_MAX_AGE'), 10);
    }

    // Rate Limiting
    if (this.configService.get('RATE_LIMIT_WINDOW_MS')) {
      this.rateLimitConfig.global.windowMs = parseInt(this.configService.get('RATE_LIMIT_WINDOW_MS'), 10);
    }
    if (this.configService.get('RATE_LIMIT_MAX_REQUESTS')) {
      this.rateLimitConfig.global.max = parseInt(this.configService.get('RATE_LIMIT_MAX_REQUESTS'), 10);
    }
  }

  private validateSecurityConfig() {
    // Validate JWT configuration
    if (!this.authConfig.jwt.enabled) {
      this.logger.warn('JWT authentication is disabled');
    }
    if (this.authConfig.jwt.expiresIn === '24h' && process.env.NODE_ENV === 'production') {
      this.logger.warn('Using default JWT expiration time in production');
    }

    // Validate MFA configuration
    if (!this.authConfig.mfa.enabled && process.env.NODE_ENV === 'production') {
      this.logger.warn('MFA is disabled in production environment');
    }

    // Validate password policy
    if (this.authConfig.passwordPolicy.minLength < 12 && process.env.NODE_ENV === 'production') {
      this.logger.warn('Password minimum length is less than recommended (12 characters)');
    }

    // Validate rate limiting
    if (this.rateLimitConfig.global.max > 100 && process.env.NODE_ENV === 'production') {
      this.logger.warn('Global rate limit is higher than recommended (100 requests)');
    }
  }

  // Public methods to access configuration
  getAuthConfig() {
    return { ...this.authConfig };
  }

  getAuthzConfig() {
    return { ...this.authzConfig };
  }

  getDataSecurityConfig() {
    return { ...this.dataSecurityConfig };
  }

  getRateLimitConfig() {
    return { ...this.rateLimitConfig };
  }

  updateAuthConfig(updates: Partial<typeof this.authConfig>) {
    this.authConfig.jwt = { ...this.authConfig.jwt, ...updates.jwt };
    this.authConfig.mfa = { ...this.authConfig.mfa, ...updates.mfa };
    this.authConfig.passwordPolicy = { ...this.authConfig.passwordPolicy, ...updates.passwordPolicy };
    
    this.validateSecurityConfig();
    this.eventEmitter.emit('security.config.updated', { type: 'auth', updates });
  }

  updateAuthzConfig(updates: Partial<typeof this.authzConfig>) {
    this.authzConfig.rbac = { ...this.authzConfig.rbac, ...updates.rbac };
    this.authzConfig.permissions = { ...this.authzConfig.permissions, ...updates.permissions };
    this.authzConfig.policies = { ...this.authzConfig.policies, ...updates.policies };
    
    this.validateSecurityConfig();
    this.eventEmitter.emit('security.config.updated', { type: 'authz', updates });
  }

  updateDataSecurityConfig(updates: Partial<typeof this.dataSecurityConfig>) {
    this.dataSecurityConfig.encryption = { ...this.dataSecurityConfig.encryption, ...updates.encryption };
    this.dataSecurityConfig.pii = { ...this.dataSecurityConfig.pii, ...updates.pii };
    this.dataSecurityConfig.audit = { ...this.dataSecurityConfig.audit, ...updates.audit };
    
    this.validateSecurityConfig();
    this.eventEmitter.emit('security.config.updated', { type: 'dataSecurity', updates });
  }

  updateRateLimitConfig(updates: Partial<typeof this.rateLimitConfig>) {
    this.rateLimitConfig.global = { ...this.rateLimitConfig.global, ...updates.global };
    this.rateLimitConfig.auth = { ...this.rateLimitConfig.auth, ...updates.auth };
    this.rateLimitConfig.api = { ...this.rateLimitConfig.api, ...updates.api };
    
    this.validateSecurityConfig();
    this.eventEmitter.emit('security.config.updated', { type: 'rateLimit', updates });
  }
} 