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
var SetupGuideService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupGuideService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const prisma_service_1 = require("../../prisma/prisma.service");
const email_service_1 = require("../../shared/services/email.service");
let SetupGuideService = SetupGuideService_1 = class SetupGuideService {
    constructor(configService, prisma, emailService, eventEmitter) {
        this.configService = configService;
        this.prisma = prisma;
        this.emailService = emailService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(SetupGuideService_1.name);
        this.setupSteps = [
            {
                id: 'profile',
                title: 'Complete Your Profile',
                description: 'Add your personal information and customize your profile',
                isRequired: true,
                order: 1,
                component: 'ProfileSetupForm',
            },
            {
                id: 'preferences',
                title: 'Set Your Preferences',
                description: 'Configure your notification and privacy settings',
                isRequired: true,
                order: 2,
                component: 'PreferencesForm',
            },
            {
                id: 'interests',
                title: 'Select Your Interests',
                description: 'Choose topics and activities that interest you',
                isRequired: false,
                order: 3,
                component: 'InterestsSelector',
            },
            {
                id: 'connections',
                title: 'Connect with Others',
                description: 'Find and connect with other users',
                isRequired: false,
                order: 4,
                component: 'ConnectionsExplorer',
            },
            {
                id: 'tutorial',
                title: 'Platform Tutorial',
                description: 'Learn about key features and how to use them',
                isRequired: true,
                order: 5,
                component: 'TutorialGuide',
            },
        ];
    }
    async initializeSetup(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error('User not found');
            }
            const setupProgress = await this.prisma.userSetupProgress.create({
                data: {
                    userId,
                    completedSteps: [],
                    currentStep: this.setupSteps[0].id,
                    startedAt: new Date(),
                    lastUpdated: new Date(),
                    isCompleted: false,
                    preferences: {},
                },
            });
            this.eventEmitter.emit('setup.initialized', {
                userId,
                timestamp: new Date(),
            });
            return setupProgress;
        }
        catch (error) {
            this.logger.error('Failed to initialize setup:', error);
            throw error;
        }
    }
    async completeStep(userId, stepId, data) {
        try {
            const setupProgress = await this.prisma.userSetupProgress.findUnique({
                where: { userId },
            });
            if (!setupProgress) {
                throw new Error('Setup progress not found');
            }
            const step = this.setupSteps.find(s => s.id === stepId);
            if (!step) {
                throw new Error('Invalid step ID');
            }
            if (setupProgress.completedSteps.includes(stepId)) {
                return setupProgress;
            }
            let preferences = setupProgress.preferences;
            if (data) {
                preferences = {
                    ...preferences,
                    [stepId]: data,
                };
            }
            const completedSteps = [...setupProgress.completedSteps, stepId];
            const nextStep = this.getNextStep(stepId);
            const isCompleted = !nextStep;
            const updatedProgress = await this.prisma.userSetupProgress.update({
                where: { userId },
                data: {
                    completedSteps,
                    currentStep: nextStep?.id || setupProgress.currentStep,
                    lastUpdated: new Date(),
                    isCompleted,
                    preferences,
                },
            });
            this.eventEmitter.emit('setup.step.completed', {
                userId,
                stepId,
                isCompleted,
                timestamp: new Date(),
            });
            if (isCompleted) {
                await this.handleSetupCompletion(userId);
            }
            return updatedProgress;
        }
        catch (error) {
            this.logger.error('Failed to complete setup step:', error);
            throw error;
        }
    }
    async skipStep(userId, stepId) {
        try {
            const step = this.setupSteps.find(s => s.id === stepId);
            if (!step) {
                throw new Error('Invalid step ID');
            }
            if (step.isRequired) {
                throw new Error('Cannot skip required step');
            }
            const setupProgress = await this.prisma.userSetupProgress.findUnique({
                where: { userId },
            });
            if (!setupProgress) {
                throw new Error('Setup progress not found');
            }
            const nextStep = this.getNextStep(stepId);
            const updatedProgress = await this.prisma.userSetupProgress.update({
                where: { userId },
                data: {
                    currentStep: nextStep?.id || setupProgress.currentStep,
                    lastUpdated: new Date(),
                },
            });
            this.eventEmitter.emit('setup.step.skipped', {
                userId,
                stepId,
                timestamp: new Date(),
            });
            return updatedProgress;
        }
        catch (error) {
            this.logger.error('Failed to skip setup step:', error);
            throw error;
        }
    }
    async getSetupProgress(userId) {
        try {
            const setupProgress = await this.prisma.userSetupProgress.findUnique({
                where: { userId },
            });
            if (!setupProgress) {
                throw new Error('Setup progress not found');
            }
            const currentStep = this.setupSteps.find(s => s.id === setupProgress.currentStep);
            const completedSteps = this.setupSteps.filter(s => setupProgress.completedSteps.includes(s.id));
            const remainingSteps = this.setupSteps.filter(s => !setupProgress.completedSteps.includes(s.id));
            const progress = (completedSteps.length / this.setupSteps.length) * 100;
            return {
                currentStep,
                completedSteps,
                remainingSteps,
                progress,
                preferences: setupProgress.preferences,
            };
        }
        catch (error) {
            this.logger.error('Failed to get setup progress:', error);
            throw error;
        }
    }
    getNextStep(currentStepId) {
        const currentStep = this.setupSteps.find(s => s.id === currentStepId);
        if (!currentStep)
            return undefined;
        return this.setupSteps.find(s => s.order > currentStep.order);
    }
    async handleSetupCompletion(userId) {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                throw new Error('User not found');
            }
            await this.prisma.user.update({
                where: { id: userId },
                data: { hasCompletedSetup: true },
            });
            this.eventEmitter.emit('setup.completed', {
                userId,
                timestamp: new Date(),
            });
        }
        catch (error) {
            this.logger.error('Failed to handle setup completion:', error);
            throw error;
        }
    }
};
exports.SetupGuideService = SetupGuideService;
exports.SetupGuideService = SetupGuideService = SetupGuideService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService, typeof (_a = typeof prisma_service_1.PrismaService !== "undefined" && prisma_service_1.PrismaService) === "function" ? _a : Object, email_service_1.EmailService, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], SetupGuideService);
//# sourceMappingURL=setup-guide.service.js.map