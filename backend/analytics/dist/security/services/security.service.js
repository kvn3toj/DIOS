"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const security_policy_entity_1 = require("../entities/security-policy.entity");
const crypto = require("crypto");
let SecurityService = class SecurityService {
    constructor(securityPolicyRepository) {
        this.securityPolicyRepository = securityPolicyRepository;
    }
    async onModuleInit() {
        const defaultPolicy = await this.securityPolicyRepository.findOne({
            where: { name: 'default' }
        });
        if (!defaultPolicy) {
            await this.createDefaultPolicy();
        }
    }
    async createDefaultPolicy() {
        const defaultPolicy = this.securityPolicyRepository.create({
            name: 'default',
            level: security_policy_entity_1.SecurityLevel.HIGH,
            passwordPolicy: {
                minLength: 12,
                requireUppercase: true,
                requireLowercase: true,
                requireNumbers: true,
                requireSpecialChars: true,
                maxAge: 90,
                preventReuse: 5
            },
            mfaPolicy: {
                required: true,
                allowedMethods: ['totp', 'sms'],
                gracePeriod: 7,
                rememberDevice: true,
                rememberPeriod: 30
            },
            sessionPolicy: {
                maxConcurrentSessions: 3,
                sessionTimeout: 3600,
                extendOnActivity: true,
                requireReauthForSensitive: true,
                mobileSessionTimeout: 7200
            },
            rateLimit: {
                loginAttempts: 5,
                loginBlockDuration: 900,
                apiRequestsPerMinute: 100,
                apiBlockDuration: 300
            },
            auditPolicy: {
                logLevel: 'info',
                retentionPeriod: 365,
                sensitiveActions: ['password-change', 'mfa-update', 'role-change'],
                alertThresholds: {
                    failedLogins: 10,
                    suspiciousActivities: 5
                }
            },
            encryptionSettings: {
                algorithm: 'aes-256-gcm',
                keyRotationPeriod: 30,
                minimumKeyLength: 256
            }
        });
        return this.securityPolicyRepository.save(defaultPolicy);
    }
    async validatePassword(password, policyId) {
        const policy = await this.getActivePolicy(policyId);
        const errors = [];
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
    async validateSession(sessionData, policyId) {
        const policy = await this.getActivePolicy(policyId);
        const now = Date.now();
        const sessionStart = new Date(sessionData.createdAt).getTime();
        const sessionAge = (now - sessionStart) / 1000;
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
    async validateMfaSetup(mfaData, policyId) {
        const policy = await this.getActivePolicy(policyId);
        if (!policy.mfaPolicy.required) {
            return true;
        }
        if (!policy.mfaPolicy.allowedMethods.includes(mfaData.method)) {
            return false;
        }
        const setupAge = (Date.now() - new Date(mfaData.setupDate).getTime()) / (1000 * 60 * 60 * 24);
        if (setupAge > policy.mfaPolicy.gracePeriod) {
            return false;
        }
        return true;
    }
    async encryptSensitiveData(data, policyId) {
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
    async decryptSensitiveData(encrypted, iv, policyId) {
        const policy = await this.getActivePolicy(policyId);
        const key = await this.getEncryptionKey(policy);
        const decipher = crypto.createDecipheriv(policy.encryptionSettings.algorithm, key, Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    async getActivePolicy(policyId) {
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
    async getEncryptionKey(policy) {
        const masterKey = process.env.MASTER_ENCRYPTION_KEY || 'your-secure-master-key';
        return crypto.scryptSync(masterKey, 'salt', policy.encryptionSettings.minimumKeyLength / 8);
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(security_policy_entity_1.SecurityPolicy)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SecurityService);
//# sourceMappingURL=security.service.js.map