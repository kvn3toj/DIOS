import { JwtService } from '@nestjs/jwt';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SecurityConfigService } from './security-config.service';
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
export declare class AuthService {
    private readonly jwtService;
    private readonly securityConfig;
    private readonly eventEmitter;
    private readonly prisma;
    private readonly logger;
    private readonly mfaAttempts;
    private readonly passwordResetTokens;
    constructor(jwtService: JwtService, securityConfig: SecurityConfigService, eventEmitter: EventEmitter2, prisma: PrismaService);
    validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
    hashPassword(password: string): Promise<string>;
    generateAuthTokens(userId: string, roles: string[]): Promise<AuthTokens>;
    refreshTokens(refreshToken: string): Promise<AuthTokens>;
    setupMFA(userId: string): Promise<{
        secret: string;
        qrCode: string;
    }>;
    verifyMFA(userId: string, token: string): Promise<MFAVerification>;
    validatePasswordPolicy(password: string): Promise<{
        valid: boolean;
        errors: string[];
    }>;
    private getExpirationSeconds;
    private storeMFASecret;
    private getMFASecret;
    generatePasswordResetToken(email: string): Promise<string>;
    validatePasswordResetToken(userId: string, token: string): Promise<boolean>;
    resetPassword(userId: string, token: string, newPassword: string): Promise<boolean>;
}
export {};
