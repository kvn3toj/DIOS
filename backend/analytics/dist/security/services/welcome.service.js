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
var WelcomeService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WelcomeService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const email_service_1 = require("../../shared/services/email.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let WelcomeService = WelcomeService_1 = class WelcomeService {
    constructor(configService, emailService, prisma, eventEmitter) {
        this.configService = configService;
        this.emailService = emailService;
        this.prisma = prisma;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(WelcomeService_1.name);
        this.onboardingSteps = [
            {
                id: 'profile',
                title: 'Complete Your Profile',
                description: 'Add your personal information and preferences',
                isRequired: true,
                order: 1,
            },
            {
                id: 'security',
                title: 'Setup Security',
                description: 'Configure MFA and security preferences',
                isRequired: true,
                order: 2,
            },
            {
                id: 'notifications',
                title: 'Configure Notifications',
                description: 'Set your notification preferences',
                isRequired: false,
                order: 3,
            },
            {
                id: 'tour',
                title: 'Take the Tour',
                description: 'Learn about key features and functionality',
                isRequired: false,
                order: 4,
            },
        ];
    }
    async initializeOnboarding(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const onboarding = await this.prisma.userOnboarding.create({
                data: {
                    userId,
                    completedSteps: [],
                    currentStep: this.onboardingSteps[0].id,
                    startedAt: new Date(),
                    lastUpdated: new Date(),
                    isCompleted: false,
                },
            });
            await this.emailService.sendWelcomeEmail(user.email, {
                name: user.name,
                firstStep: this.onboardingSteps[0],
            });
            this.eventEmitter.emit('onboarding.initialized', {
                userId,
                timestamp: new Date(),
            });
            return onboarding;
        }
        catch (error) {
            this.logger.error('Failed to initialize onboarding:', error);
            throw error;
        }
    }
    async completeStep(userId, stepId) {
        try {
            const onboarding = await this.prisma.userOnboarding.findUnique({
                where: { userId },
            });
            if (!onboarding) {
                throw new Error('Onboarding not found');
            }
            const step = this.onboardingSteps.find(s => s.id === stepId);
            if (!step) {
                throw new Error('Invalid step ID');
            }
            if (onboarding.completedSteps.includes(stepId)) {
                return onboarding;
            }
            const completedSteps = [...onboarding.completedSteps, stepId];
            const nextStep = this.getNextStep(stepId);
            const isCompleted = !nextStep;
            const updatedOnboarding = await this.prisma.userOnboarding.update({
                where: { userId },
                data: {
                    completedSteps,
                    currentStep: nextStep?.id || onboarding.currentStep,
                    lastUpdated: new Date(),
                    isCompleted,
                },
            });
            this.eventEmitter.emit('onboarding.step.completed', {
                userId,
                stepId,
                isCompleted,
                timestamp: new Date(),
            });
            if (isCompleted) {
                await this.handleOnboardingCompletion(userId);
            }
            return updatedOnboarding;
        }
        catch (error) {
            this.logger.error('Failed to complete onboarding step:', error);
            throw error;
        }
    }
    async skipStep(userId, stepId) {
        try {
            const step = this.onboardingSteps.find(s => s.id === stepId);
            if (!step) {
                throw new Error('Invalid step ID');
            }
            if (step.isRequired) {
                throw new Error('Cannot skip required step');
            }
            const onboarding = await this.prisma.userOnboarding.findUnique({
                where: { userId },
            });
            if (!onboarding) {
                throw new Error('Onboarding not found');
            }
            const nextStep = this.getNextStep(stepId);
            const updatedOnboarding = await this.prisma.userOnboarding.update({
                where: { userId },
                data: {
                    currentStep: nextStep?.id || onboarding.currentStep,
                    lastUpdated: new Date(),
                },
            });
            this.eventEmitter.emit('onboarding.step.skipped', {
                userId,
                stepId,
                timestamp: new Date(),
            });
            return updatedOnboarding;
        }
        catch (error) {
            this.logger.error('Failed to skip onboarding step:', error);
            throw error;
        }
    }
    async getOnboardingProgress(userId) {
        try {
            const onboarding = await this.prisma.userOnboarding.findUnique({
                where: { userId },
            });
            if (!onboarding) {
                throw new Error('Onboarding not found');
            }
            const currentStep = this.onboardingSteps.find(s => s.id === onboarding.currentStep);
            const completedSteps = this.onboardingSteps.filter(s => onboarding.completedSteps.includes(s.id));
            const remainingSteps = this.onboardingSteps.filter(s => !onboarding.completedSteps.includes(s.id));
            const progress = (completedSteps.length / this.onboardingSteps.length) * 100;
            return {
                currentStep,
                completedSteps,
                remainingSteps,
                progress,
            };
        }
        catch (error) {
            this.logger.error('Failed to get onboarding progress:', error);
            throw error;
        }
    }
    getNextStep(currentStepId) {
        const currentStep = this.onboardingSteps.find(s => s.id === currentStepId);
        if (!currentStep)
            return undefined;
        return this.onboardingSteps.find(s => s.order > currentStep.order);
    }
    async handleOnboardingCompletion(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error('User not found');
            }
            await this.emailService.sendOnboardingCompletionEmail(user.email, {
                name: user.name,
            });
            this.eventEmitter.emit('onboarding.completed', {
                userId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to handle onboarding completion:', error);
            throw error;
        }
    }
};
exports.WelcomeService = WelcomeService;
exports.WelcomeService = WelcomeService = WelcomeService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        email_service_1.EmailService, typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], WelcomeService);
//# sourceMappingURL=welcome.service.js.map