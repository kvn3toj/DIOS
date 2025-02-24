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
var PasswordController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("../services/auth.service");
const email_service_1 = require("../../shared/services/email.service");
let PasswordController = PasswordController_1 = class PasswordController {
    constructor(authService, emailService) {
        this.authService = authService;
        this.emailService = emailService;
        this.logger = new common_1.Logger(PasswordController_1.name);
    }
    async forgotPassword(email) {
        try {
            const resetToken = await this.authService.generatePasswordResetToken(email);
            await this.emailService.sendPasswordResetEmail(email, resetToken);
            return {
                success: true,
                message: 'If an account exists with this email, a password reset link has been sent.',
            };
        }
        catch (error) {
            this.logger.error('Password reset request failed:', error);
            throw new common_1.HttpException('Failed to process password reset request', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async resetPassword(userId, token, newPassword) {
        try {
            const success = await this.authService.resetPassword(userId, token, newPassword);
            if (success) {
                return {
                    success: true,
                    message: 'Password has been reset successfully.',
                };
            }
            else {
                throw new common_1.HttpException('Invalid or expired reset token', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        catch (error) {
            this.logger.error('Password reset failed:', error);
            throw new common_1.HttpException(error.message || 'Failed to reset password', common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.PasswordController = PasswordController;
__decorate([
    (0, common_1.Post)('forgot'),
    __param(0, (0, common_1.Body)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PasswordController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset'),
    __param(0, (0, common_1.Body)('userId')),
    __param(1, (0, common_1.Body)('token')),
    __param(2, (0, common_1.Body)('newPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PasswordController.prototype, "resetPassword", null);
exports.PasswordController = PasswordController = PasswordController_1 = __decorate([
    (0, common_1.Controller)('auth/password'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        email_service_1.EmailService])
], PasswordController);
//# sourceMappingURL=password.controller.js.map