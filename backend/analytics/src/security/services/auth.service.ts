import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SecurityConfigService } from './security-config.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface MFAVerification {
  verified: boolean;
  remainingAttempts: number;
  blockDuration?: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly mfaAttempts = new Map<string, { attempts: number; blockedUntil?: Date }>();
  private readonly passwordResetTokens = new Map<string, { token: string; expiresAt: Date }>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly securityConfig: SecurityConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly prisma: PrismaService,
  ) {}

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      this.logger.error('Password validation failed', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async hashPassword(password: string): Promise<string> {
    const { saltRounds } = this.securityConfig.getDataSecurityConfig().encryption;
    try {
      return await bcrypt.hash(password, saltRounds);
    } catch (error) {
      this.logger.error('Password hashing failed', error);
      throw new Error('Failed to hash password');
    }
  }

  async generateAuthTokens(userId: string, roles: string[]): Promise<AuthTokens> {
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

      const refreshToken = this.jwtService.sign(
        { ...payload, type: 'refresh' },
        { expiresIn: authConfig.jwt.refreshExpiresIn },
      );

      // Calculate expiration in seconds
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
    } catch (error) {
      this.logger.error('Token generation failed', error);
      throw new Error('Failed to generate authentication tokens');
    }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateAuthTokens(payload.sub, payload.roles);
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async setupMFA(userId: string): Promise<{ secret: string; qrCode: string }> {
    try {
      const secret = speakeasy.generateSecret({
        name: `SuperApp-Gamifier (${userId})`,
      });

      // Store the secret securely (implement secure storage)
      await this.storeMFASecret(userId, secret.base32);

      this.eventEmitter.emit('auth.mfa.setup', {
        userId,
        timestamp: new Date(),
      });

      return {
        secret: secret.base32,
        qrCode: secret.otpauth_url,
      };
    } catch (error) {
      this.logger.error('MFA setup failed', error);
      throw new Error('Failed to setup MFA');
    }
  }

  async verifyMFA(userId: string, token: string): Promise<MFAVerification> {
    const mfaConfig = this.securityConfig.getAuthConfig().mfa;
    const userAttempts = this.mfaAttempts.get(userId) || { attempts: 0 };

    // Check if user is blocked
    if (userAttempts.blockedUntil && userAttempts.blockedUntil > new Date()) {
      return {
        verified: false,
        remainingAttempts: 0,
        blockDuration: Math.ceil((userAttempts.blockedUntil.getTime() - Date.now()) / 1000),
      };
    }

    try {
      // Get user's MFA secret (implement secure retrieval)
      const secret = await this.getMFASecret(userId);

      const verified = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: mfaConfig.totpWindow,
      });

      if (verified) {
        // Reset attempts on successful verification
        this.mfaAttempts.delete(userId);
        
        this.eventEmitter.emit('auth.mfa.verified', {
          userId,
          timestamp: new Date(),
        });

        return {
          verified: true,
          remainingAttempts: mfaConfig.maxAttempts,
        };
      } else {
        // Increment failed attempts
        userAttempts.attempts += 1;

        if (userAttempts.attempts >= mfaConfig.maxAttempts) {
          // Block user
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
    } catch (error) {
      this.logger.error('MFA verification failed', error);
      throw new Error('Failed to verify MFA token');
    }
  }

  async validatePasswordPolicy(password: string): Promise<{ valid: boolean; errors: string[] }> {
    const policy = this.securityConfig.getAuthConfig().passwordPolicy;
    const errors: string[] = [];

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

  private getExpirationSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600; // Default to 1 hour

    const [, value, unit] = match;
    const multipliers = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
    };

    return parseInt(value) * multipliers[unit];
  }

  // These methods should be implemented to securely store and retrieve MFA secrets
  private async storeMFASecret(userId: string, secret: string): Promise<void> {
    try {
      const { algorithm } = this.securityConfig.getDataSecurityConfig().encryption;
      const encryptionKey = process.env.ENCRYPTION_KEY || 'default-encryption-key';
      const iv = crypto.randomBytes(16);
      
      const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv);
      let encryptedSecret = cipher.update(secret, 'utf8', 'hex');
      encryptedSecret += cipher.final('hex');

      // Store the encrypted secret and IV in the database
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          mfaSecret: encryptedSecret,
          mfaSecretIv: iv.toString('hex'),
        },
      });

      this.logger.debug(`MFA secret stored securely for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to store MFA secret:', error);
      throw new Error('Failed to store MFA secret');
    }
  }

  private async getMFASecret(userId: string): Promise<string> {
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
    } catch (error) {
      this.logger.error('Failed to retrieve MFA secret:', error);
      throw new Error('Failed to retrieve MFA secret');
    }
  }

  async generatePasswordResetToken(email: string): Promise<string> {
    try {
      const user = await this.prisma.user.findUnique({ where: { email } });
      if (!user) {
        // Return success even if user not found to prevent email enumeration
        return crypto.randomBytes(32).toString('hex');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiration

      // Store the reset token
      this.passwordResetTokens.set(user.id, { token: resetToken, expiresAt });

      this.eventEmitter.emit('auth.password.reset.requested', {
        userId: user.id,
        timestamp: new Date(),
      });

      return resetToken;
    } catch (error) {
      this.logger.error('Failed to generate password reset token:', error);
      throw new Error('Failed to generate password reset token');
    }
  }

  async validatePasswordResetToken(userId: string, token: string): Promise<boolean> {
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
    } catch (error) {
      this.logger.error('Failed to validate password reset token:', error);
      return false;
    }
  }

  async resetPassword(userId: string, token: string, newPassword: string): Promise<boolean> {
    try {
      // Validate the token
      const isValid = await this.validatePasswordResetToken(userId, token);
      if (!isValid) {
        throw new Error('Invalid or expired reset token');
      }

      // Validate the new password against policy
      const { valid, errors } = await this.validatePasswordPolicy(newPassword);
      if (!valid) {
        throw new Error(`Invalid password: ${errors.join(', ')}`);
      }

      // Get user's password history
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { passwordHistory: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Check if the new password was used recently
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

      // Hash the new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update the user's password and add to history
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

      // Remove the used reset token
      this.passwordResetTokens.delete(userId);

      this.eventEmitter.emit('auth.password.reset.completed', {
        userId,
        timestamp: new Date(),
      });

      return true;
    } catch (error) {
      this.logger.error('Failed to reset password:', error);
      throw error;
    }
  }
} 