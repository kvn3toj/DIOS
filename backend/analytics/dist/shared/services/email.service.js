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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
let EmailService = EmailService_1 = class EmailService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
        this.transporter = nodemailer.createTransport({
            host: this.configService.get('SMTP_HOST'),
            port: this.configService.get('SMTP_PORT'),
            secure: this.configService.get('SMTP_SECURE', true),
            auth: {
                user: this.configService.get('SMTP_USER'),
                pass: this.configService.get('SMTP_PASS'),
            },
        });
    }
    async sendPasswordResetEmail(email, token) {
        try {
            const resetLink = `${this.frontendUrl}/auth/reset-password?token=${token}`;
            await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM', 'noreply@superapp-gamifier.com'),
                to: email,
                subject: 'Password Reset Request',
                html: `
          <h1>Password Reset Request</h1>
          <p>You have requested to reset your password. Click the link below to proceed:</p>
          <p><a href="${resetLink}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you did not request this password reset, please ignore this email.</p>
          <p>For security reasons, please do not share this link with anyone.</p>
        `,
                text: `
          Password Reset Request
          
          You have requested to reset your password. Click the link below to proceed:
          ${resetLink}
          
          This link will expire in 1 hour.
          
          If you did not request this password reset, please ignore this email.
          For security reasons, please do not share this link with anyone.
        `,
            });
            this.logger.debug(`Password reset email sent to ${email}`);
        }
        catch (error) {
            this.logger.error('Failed to send password reset email:', error);
            throw new Error('Failed to send password reset email');
        }
    }
    async sendVerificationEmail(email, token) {
        try {
            const verificationLink = `${this.frontendUrl}/auth/verify?token=${token}`;
            await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM', 'noreply@superapp-gamifier.com'),
                to: email,
                subject: 'Verify Your Email',
                html: `
          <h1>Welcome to SuperApp Gamifier!</h1>
          <p>Thank you for registering. Please click the link below to verify your email address:</p>
          <p><a href="${verificationLink}">Verify Email</a></p>
          <p>This link will expire in 24 hours.</p>
          <p>If you did not create an account, please ignore this email.</p>
          <p>For security reasons, please do not share this link with anyone.</p>
        `,
                text: `
          Welcome to SuperApp Gamifier!
          
          Thank you for registering. Please click the link below to verify your email address:
          ${verificationLink}
          
          This link will expire in 24 hours.
          
          If you did not create an account, please ignore this email.
          For security reasons, please do not share this link with anyone.
        `,
            });
            this.logger.debug(`Verification email sent to ${email}`);
        }
        catch (error) {
            this.logger.error('Failed to send verification email:', error);
            throw new Error('Failed to send verification email');
        }
    }
    async sendWelcomeEmail(email, data) {
        try {
            const dashboardLink = `${this.frontendUrl}/dashboard`;
            await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM', 'noreply@superapp-gamifier.com'),
                to: email,
                subject: 'Welcome to SuperApp Gamifier!',
                html: `
          <h1>Welcome to SuperApp Gamifier, ${data.name}! 🎮</h1>
          <p>We're excited to have you join our community! Your account has been successfully created and verified.</p>
          
          <h2>Getting Started</h2>
          <p>Your first step is: <strong>${data.firstStep.title}</strong></p>
          <p>${data.firstStep.description}</p>
          
          <p>To begin your journey:</p>
          <ol>
            <li>Visit your <a href="${dashboardLink}">dashboard</a></li>
            <li>Complete your profile setup</li>
            <li>Follow the guided tour</li>
            <li>Earn your first achievement!</li>
          </ol>

          <p>Need help? Our support team is always here to assist you.</p>
          
          <p>Let the games begin! 🚀</p>
          <p>The SuperApp Gamifier Team</p>
        `,
                text: `
          Welcome to SuperApp Gamifier, ${data.name}! 🎮

          We're excited to have you join our community! Your account has been successfully created and verified.

          Getting Started
          Your first step is: ${data.firstStep.title}
          ${data.firstStep.description}

          To begin your journey:
          1. Visit your dashboard: ${dashboardLink}
          2. Complete your profile setup
          3. Follow the guided tour
          4. Earn your first achievement!

          Need help? Our support team is always here to assist you.

          Let the games begin! 🚀
          The SuperApp Gamifier Team
        `,
            });
            this.logger.debug(`Welcome email sent to ${email}`);
        }
        catch (error) {
            this.logger.error('Failed to send welcome email:', error);
            throw new Error('Failed to send welcome email');
        }
    }
    async sendOnboardingCompletionEmail(email, data) {
        try {
            const dashboardLink = `${this.frontendUrl}/dashboard`;
            const achievementsLink = `${this.frontendUrl}/achievements`;
            const communityLink = `${this.frontendUrl}/community`;
            await this.transporter.sendMail({
                from: this.configService.get('SMTP_FROM', 'noreply@superapp-gamifier.com'),
                to: email,
                subject: 'Congratulations on Completing Your Onboarding! 🎉',
                html: `
          <h1>Congratulations, ${data.name}! 🎉</h1>
          <p>You've successfully completed your onboarding journey with SuperApp Gamifier!</p>
          
          <h2>What's Next?</h2>
          <p>Here are some exciting things you can do now:</p>
          <ul>
            <li>Explore more <a href="${achievementsLink}">achievements</a> to unlock</li>
            <li>Connect with other players in our <a href="${communityLink}">community</a></li>
            <li>Check your progress on your <a href="${dashboardLink}">dashboard</a></li>
            <li>Start your first quest</li>
          </ul>

          <p>Remember, this is just the beginning of your journey. Keep exploring, achieving, and having fun!</p>
          
          <h2>Need Help?</h2>
          <p>Our support team is always here to help you make the most of your experience.</p>
          
          <p>Game on! 🎮</p>
          <p>The SuperApp Gamifier Team</p>
        `,
                text: `
          Congratulations, ${data.name}! 🎉

          You've successfully completed your onboarding journey with SuperApp Gamifier!

          What's Next?
          Here are some exciting things you can do now:
          - Explore more achievements: ${achievementsLink}
          - Connect with other players in our community: ${communityLink}
          - Check your progress on your dashboard: ${dashboardLink}
          - Start your first quest

          Remember, this is just the beginning of your journey. Keep exploring, achieving, and having fun!

          Need Help?
          Our support team is always here to help you make the most of your experience.

          Game on! 🎮
          The SuperApp Gamifier Team
        `,
            });
            this.logger.debug(`Onboarding completion email sent to ${email}`);
        }
        catch (error) {
            this.logger.error('Failed to send onboarding completion email:', error);
            throw new Error('Failed to send onboarding completion email');
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map