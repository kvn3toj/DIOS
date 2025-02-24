import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmailService } from '../../shared/services/email.service';
import { PrismaService } from '../../prisma/prisma.service';
interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    isRequired: boolean;
    order: number;
}
interface UserOnboarding {
    userId: string;
    completedSteps: string[];
    currentStep: string;
    startedAt: Date;
    lastUpdated: Date;
    isCompleted: boolean;
}
export declare class WelcomeService {
    private readonly configService;
    private readonly emailService;
    private readonly prisma;
    private readonly eventEmitter;
    private readonly logger;
    private readonly onboardingSteps;
    constructor(configService: ConfigService, emailService: EmailService, prisma: PrismaService, eventEmitter: EventEmitter2);
    initializeOnboarding(userId: string): Promise<UserOnboarding>;
    completeStep(userId: string, stepId: string): Promise<UserOnboarding>;
    skipStep(userId: string, stepId: string): Promise<UserOnboarding>;
    getOnboardingProgress(userId: string): Promise<{
        currentStep: OnboardingStep;
        completedSteps: OnboardingStep[];
        remainingSteps: OnboardingStep[];
        progress: number;
    }>;
    private getNextStep;
    private handleOnboardingCompletion;
}
export {};
