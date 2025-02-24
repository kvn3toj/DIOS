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
var AuthService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const event_emitter_1 = require("@nestjs/event-emitter");
const security_config_service_1 = require("./security-config.service");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const crypto = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    constructor(jwtService, securityConfig, eventEmitter, prisma) {
        this.jwtService = jwtService;
        this.securityConfig = securityConfig;
        this.eventEmitter = eventEmitter;
        this.prisma = prisma;
        this.logger = new common_1.Logger(AuthService_1.name);
        this.mfaAttempts = new Map();
        this.passwordResetTokens = new Map();
    }
    async validatePassword(plainPassword, hashedPassword) {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        }
        catch (error) {
            this.logger.error('Password validation failed', error);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
    }
    async hashPassword(password) {
        const { saltRounds } = this.securityConfig.getDataSecurityConfig().encryption;
        try {
            return await bcrypt.hash(password, saltRounds);
        }
        catch (error) {
            this.logger.error('Password hashing failed', error);
            throw new Error('Failed to hash password');
        }
    }
    async generateAuthTokens(userId, roles) {
        const authConfig = this.securityConfig.getAuthConfig();
        try {
            const payload = {
                sub: userId,
                roles,
                type: 'access',
            };
            const accessToken = this.jwtService.sign(payload, {
                expiresIn: authConfig.jwt.expiresIn,
                issuer: authConfig.jwt.issuer,
                audience: authConfig.jwt.audience,
            });
            const refreshToken = this.jwtService.sign({ ...payload, type: 'refresh' }, { expiresIn: authConfig.jwt.refreshExpiresIn });
            const expiresIn = this.getExpirationSeconds(authConfig.jwt.expiresIn);
            this.eventEmitter.emit('auth.tokens.generated', {
                userId,
                timestamp: new Date(),
            });
            return {
                accessToken,
                refreshToken,
                expiresIn,
            };
        }
        catch (error) {
            this.logger.error('Token generation failed', error);
            throw new Error('Failed to generate authentication tokens');
        }
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            if (payload.type !== 'refresh') {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            return this.generateAuthTokens(payload.sub, payload.roles);
        }
        catch (error) {
            this.logger.error('Token refresh failed', error);
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async setupMFA(userId) {
        try {
            const secret = speakeasy.generateSecret({
                name: `SuperApp-Gamifier (${userId})`,
            });
            await this.storeMFASecret(userId, secret.base32);
            this.eventEmitter.emit('auth.mfa.setup', {
                userId,
                timestamp: new Date(),
            });
            return {
                secret: secret.base32,
                qrCode: secret.otpauth_url,
            };
        }
        catch (error) {
            this.logger.error('MFA setup failed', error);
            throw new Error('Failed to setup MFA');
        }
    }
    async verifyMFA(userId, token) {
        const mfaConfig = this.securityConfig.getAuthConfig().mfa;
        const userAttempts = this.mfaAttempts.get(userId) || { attempts: 0 };
        if (userAttempts.blockedUntil && userAttempts.blockedUntil > new Date()) {
            return {
                verified: false,
                remainingAttempts: 0,
                blockDuration: Math.ceil((userAttempts.blockedUntil.getTime() - Date.now()) / 1000),
            };
        }
        try {
            const secret = await this.getMFASecret(userId);
            const verified = speakeasy.totp.verify({
                secret,
                encoding: 'base32',
                token,
                window: mfaConfig.totpWindow,
            });
            if (verified) {
                this.mfaAttempts.delete(userId);
                this.eventEmitter.emit('auth.mfa.verified', {
                    userId,
                    timestamp: new Date(),
                });
                return {
                    verified: true,
                    remainingAttempts: mfaConfig.maxAttempts,
                };
            }
            else {
                userAttempts.attempts += 1;
                if (userAttempts.attempts >= mfaConfig.maxAttempts) {
                    userAttempts.blockedUntil = new Date(Date.now() + mfaConfig.blockDuration * 1000);
                    this.mfaAttempts.set(userId, userAttempts);
                    this.eventEmitter.emit('auth.mfa.blocked', {
                        userId,
                        timestamp: new Date(),
                        duration: mfaConfig.blockDuration,
                    });
                    return {
                        verified: false,
                        remainingAttempts: 0,
                        blockDuration: mfaConfig.blockDuration,
                    };
                }
                this.mfaAttempts.set(userId, userAttempts);
                return {
                    verified: false,
                    remainingAttempts: mfaConfig.maxAttempts - userAttempts.attempts,
                };
            }
        }
        catch (error) {
            this.logger.error('MFA verification failed', error);
            throw new Error('Failed to verify MFA token');
        }
    }
    async validatePasswordPolicy(password) {
        const policy = this.securityConfig.getAuthConfig().passwordPolicy;
        const errors = [];
        if (password.length < policy.minLength) {
            errors.push(`Password must be at least ${policy.minLength} characters long`);
        }
        if (policy.requireUppercase && !/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (policy.requireLowercase && !/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (policy.requireNumbers && !/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    getExpirationSeconds(expiresIn) {
        const match = expiresIn.match(/^(\d+)([smhd])$/);
        if (!match)
            return 3600;
        const [, value, unit] = match;
        const multipliers = {
            s: 1,
            m: 60,
            h: 3600,
            d: 86400,
        };
        return parseInt(value) * multipliers[unit];
    }
    async storeMFASecret(userId, secret) {
        try {
            const { algorithm } = this.securityConfig.getDataSecurityConfig().encryption;
            const encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key';
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
            let encryptedSecret = cipher.update(secret, 'utf8', 'hex');
            encryptedSecret += cipher.final('hex');
            await this.prisma.user.update({
                where: { id: userId },
                data: {
                    mfaSecret: encryptedSecret,
                    mfaSecretIv: iv.toString('hex'),
                },
            });
            this.logger.debug(`MFA secret stored securely for user ${userId}`);
        }
        catch (error) {
            this.logger.error('Failed to store MFA secret:', error);
            throw new Error('Failed to store MFA secret');
        }
    }
    async getMFASecret(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    mfaSecret: true,
                    mfaSecretIv: true,
                },
            });
            if (!user?.mfaSecret || !user?.mfaSecretIv) {
                throw new Error('MFA secret not found');
            }
            const { algorithm } = this.securityConfig.getDataSecurityConfig().encryption;
            const encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key';
            const iv = Buffer.from(user.mfaSecretIv, 'hex');
            const decipher = crypto.createDecipheriv(algorithm, encryptionKey, iv);
            let decryptedSecret = decipher.update(user.mfaSecret, 'hex', 'utf8');
            decryptedSecret += decipher.final('utf8');
            return decryptedSecret;
        }
        catch (error) {
            this.logger.error('Failed to retrieve MFA secret:', error);
            throw new Error('Failed to retrieve MFA secret');
        }
    }
    async generatePasswordResetToken(email) {
        try {
            const user = await this.prisma.user.findUnique({ where: { email } });
            if (!user) {
                return crypto.randomBytes(32).toString('hex');
            }
            const resetToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 3600000);
            this.passwordResetTokens.set(user.id, { token: resetToken, expiresAt });
            this.eventEmitter.emit('auth.password.reset.requested', {
                userId: user.id,
                timestamp: new Date(),
            });
            return resetToken;
        }
        catch (error) {
            this.logger.error('Failed to generate password reset token:', error);
            throw new Error('Failed to generate password reset token');
        }
    }
    async validatePasswordResetToken(userId, token) {
        try {
            const storedData = this.passwordResetTokens.get(userId);
            if (!storedData) {
                return false;
            }
            const { token: storedToken, expiresAt } = storedData;
            if (expiresAt < new Date() || token !== storedToken) {
                this.passwordResetTokens.delete(userId);
                return false;
            }
            return true;
        }
        catch (error) {
            this.logger.error('Failed to validate password reset token:', error);
            return false;
        }
    }
    async resetPassword(userId, token, newPassword) {
        try {
            const isValid = await this.validatePasswordResetToken(userId, token);
            if (!isValid) {
                throw new Error('Invalid or expired reset token');
            }
            const { valid, errors } = await this.validatePasswordPolicy(newPassword);
            if (!valid) {
                throw new Error(`Invalid password: ${errors.join(', ')}`);
            }
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { passwordHistory: true },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const { preventReuse } = this.securityConfig.getAuthConfig().passwordPolicy;
            const recentPasswords = user.passwordHistory
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .slice(0, preventReuse);
            for (const historicPassword of recentPasswords) {
                const isSame = await this.validatePassword(newPassword, historicPassword.hashedPassword);
                if (isSame) {
                    throw new Error(`Password was used in the last ${preventReuse} passwords`);
                }
            }
            const hashedPassword = await this.hashPassword(newPassword);
            await this.prisma.$transaction([
                this.prisma.user.update({
                    where: { id: userId },
                    data: { password: hashedPassword },
                }),
                this.prisma.passwordHistory.create({
                    data: {
                        userId,
                        hashedPassword,
                    },
                }),
            ]);
            this.passwordResetTokens.delete(userId);
            this.eventEmitter.emit('auth.password.reset.completed', {
                userId,
                timestamp: new Date(),
            });
            return true;
        }
        catch (error) {
            this.logger.error('Failed to reset password:', error);
            throw error;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object, security_config_service_1.SecurityConfigService, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object, typeof (_c = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _c : Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map