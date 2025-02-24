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
var RegistrationController_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegistrationController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../services/auth.service");
const email_service_1 = require("../../shared/services/email.service");
const prisma_service_1 = require("../../prisma/prisma.service");
const crypto = require("crypto");
let RegistrationController = RegistrationController_1 = class RegistrationController {
    constructor(authService, emailService, prisma) {
        this.authService = authService;
        this.emailService = emailService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(RegistrationController_1.name);
        this.verificationTokens = new Map();
    }
    async register(email, password, name) {
        try {
            const existingUser = await this.prisma.user.findUnique({
                where: { email },
            });
            if (existingUser) {
                throw new common_1.HttpException('Email already registered', common_1.HttpStatus.CONFLICT);
            }
            const { valid, errors } = await this.authService.validatePasswordPolicy(password);
            if (!valid) {
                throw new common_1.HttpException(`Invalid password: ${errors.join(', ')}`, common_1.HttpStatus.BAD_REQUEST);
            }
            const hashedPassword = await this.authService.hashPassword(password);
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    isVerified: false,
                },
            });
            this.verificationTokens.set(user.id, { token: verificationToken, expiresAt });
            await this.emailService.sendVerificationEmail(email, verificationToken);
            return {
                success: true,
                message: 'Registration successful. Please check your email to verify your account.',
                userId: user.id,
            };
        }
        catch (error) {
            this.logger.error('Registration failed:', error);
            throw error;
        }
    }
    async verifyEmail(token) {
        try {
            let userId;
            let foundToken;
            for (const [id, data] of this.verificationTokens.entries()) {
                if (data.token === token) {
                    userId = id;
                    foundToken = data;
                    break;
                }
            }
            if (!userId || !foundToken) {
                throw new common_1.HttpException('Invalid verification token', common_1.HttpStatus.BAD_REQUEST);
            }
            if (foundToken.expiresAt < new Date()) {
                this.verificationTokens.delete(userId);
                throw new common_1.HttpException('Verification token expired', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.user.update({
                where: { id: userId },
                data: { isVerified: true },
            });
            this.verificationTokens.delete(userId);
            return {
                success: true,
                message: 'Email verified successfully. You can now log in.',
            };
        }
        catch (error) {
            this.logger.error('Email verification failed:', error);
            throw error;
        }
    }
    async resendVerification(email) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });
            if (!user) {
                return {
                    success: true,
                    message: 'If an account exists with this email, a verification link has been sent.',
                };
            }
            if (user.isVerified) {
                throw new common_1.HttpException('Email already verified', common_1.HttpStatus.BAD_REQUEST);
            }
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            this.verificationTokens.set(user.id, { token: verificationToken, expiresAt });
            await this.emailService.sendVerificationEmail(email, verificationToken);
            return {
                success: true,
                message: 'If an account exists with this email, a verification link has been sent.',
            };
        }
        catch (error) {
            this.logger.error('Resend verification failed:', error);
            throw error;
        }
    }
};
exports.RegistrationController = RegistrationController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)('email')),
    __param(1, (0, common_1.Body)('password')),
    __param(2, (0, common_1.Body)('name')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RegistrationController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('verify/:token'),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegistrationController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RegistrationController.prototype, "resendVerification", null);
exports.RegistrationController = RegistrationController = RegistrationController_1 = __decorate([
    (0, common_1.Controller)('auth/register'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        email_service_1.EmailService, typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object])
], RegistrationController);
//# sourceMappingURL=registration.controller.js.map