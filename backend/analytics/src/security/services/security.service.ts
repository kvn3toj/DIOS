import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityPolicy, SecurityLevel } from '../entities/security-policy.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class SecurityService implements OnModuleInit {
  constructor(
    @InjectRepository(SecurityPolicy)
    private securityPolicyRepository: Repository<SecurityPolicy>
  ) {}

  async onModuleInit() {
    // Create default security policy if none exists
    const defaultPolicy = await this.securityPolicyRepository.findOne({
      where: { name: 'default' }
    });

    if (!defaultPolicy) {
      await this.createDefaultPolicy();
    }
  }

  private async createDefaultPolicy(): Promise<SecurityPolicy> {
    const defaultPolicy = this.securityPolicyRepository.create({
      name: 'default',
      level: SecurityLevel.HIGH,
      passwordPolicy: {
        minLength: 12,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90, // days
        preventReuse: 5
      },
      mfaPolicy: {
        required: true,
        allowedMethods: ['totp', 'sms'],
        gracePeriod: 7, // days
        rememberDevice: true,
        rememberPeriod: 30 // days
      },
      sessionPolicy: {
        maxConcurrentSessions: 3,
        sessionTimeout: 3600, // 1 hour
        extendOnActivity: true,
        requireReauthForSensitive: true,
        mobileSessionTimeout: 7200 // 2 hours
      },
      rateLimit: {
        loginAttempts: 5,
        loginBlockDuration: 900, // 15 minutes
        apiRequestsPerMinute: 100,
        apiBlockDuration: 300 // 5 minutes
      },
      auditPolicy: {
        logLevel: 'info',
        retentionPeriod: 365, // days
        sensitiveActions: ['password-change', 'mfa-update', 'role-change'],
        alertThresholds: {
          failedLogins: 10,
          suspiciousActivities: 5
        }
      },
      encryptionSettings: {
        algorithm: 'aes-256-gcm',
        keyRotationPeriod: 30, // days
        minimumKeyLength: 256
      }
    });

    return this.securityPolicyRepository.save(defaultPolicy);
  }

  async validatePassword(password: string, policyId?: string): Promise<{ valid: boolean; errors: string[] }> {
    const policy = await this.getActivePolicy(policyId);
    const errors: string[] = [];

    if (password.length < policy.passwordPolicy.minLength) {
      errors.push(`Password must be at least ${policy.passwordPolicy.minLength} characters long`);
    }
    if (policy.passwordPolicy.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (policy.passwordPolicy.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (policy.passwordPolicy.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    if (policy.passwordPolicy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async validateSession(sessionData: any, policyId?: string): Promise<boolean> {
    const policy = await this.getActivePolicy(policyId);
    const now = Date.now();
    const sessionStart = new Date(sessionData.createdAt).getTime();
    const sessionAge = (now - sessionStart) / 1000; // in seconds

    const timeout = sessionData.isMobile
      ? policy.sessionPolicy.mobileSessionTimeout
      : policy.sessionPolicy.sessionTimeout;

    if (sessionAge > timeout) {
      return false;
    }

    if (policy.sessionPolicy.requireReauthForSensitive && sessionData.accessingSensitiveResource) {
      return false;
    }

    return true;
  }

  async validateMfaSetup(mfaData: any, policyId?: string): Promise<boolean> {
    const policy = await this.getActivePolicy(policyId);
    
    if (!policy.mfaPolicy.required) {
      return true;
    }

    if (!policy.mfaPolicy.allowedMethods.includes(mfaData.method)) {
      return false;
    }

    const setupAge = (Date.now() - new Date(mfaData.setupDate).getTime()) / (1000 * 60 * 60 * 24); // in days
    if (setupAge > policy.mfaPolicy.gracePeriod) {
      return false;
    }

    return true;
  }

  async encryptSensitiveData(data: string, policyId?: string): Promise<{ encrypted: string; iv: string }> {
    const policy = await this.getActivePolicy(policyId);
    const iv = crypto.randomBytes(16);
    const key = await this.getEncryptionKey(policy);
    
    const cipher = crypto.createCipheriv(policy.encryptionSettings.algorithm, key, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      encrypted,
      iv: iv.toString('hex')
    };
  }

  async decryptSensitiveData(encrypted: string, iv: string, policyId?: string): Promise<string> {
    const policy = await this.getActivePolicy(policyId);
    const key = await this.getEncryptionKey(policy);
    
    const decipher = crypto.createDecipheriv(
      policy.encryptionSettings.algorithm,
      key,
      Buffer.from(iv, 'hex')
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private async getActivePolicy(policyId?: string): Promise<SecurityPolicy> {
    if (policyId) {
      const policy = await this.securityPolicyRepository.findOne({
        where: { id: policyId, isActive: true }
      });
      if (policy) {
        return policy;
      }
    }

    return this.securityPolicyRepository.findOne({
      where: { name: 'default', isActive: true }
    });
  }

  private async getEncryptionKey(policy: SecurityPolicy): Promise<Buffer> {
    // In a production environment, this should use a proper key management service
    // This is a simplified example
    const masterKey = process.env.MASTER_ENCRYPTION_KEY || 'your-secure-master-key';
    return crypto.scryptSync(masterKey, 'salt', policy.encryptionSettings.minimumKeyLength / 8);
  }
} 