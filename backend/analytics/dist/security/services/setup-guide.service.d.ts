import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../shared/services/email.service';
interface SetupStep {
    id: string;
    title: string;
    description: string;
    isRequired: boolean;
    order: number;
    component: string;
}
interface UserSetupProgress {
    userId: string;
    completedSteps: string[];
    currentStep: string;
    startedAt: Date;
    lastUpdated: Date;
    isCompleted: boolean;
    preferences: Record<string, any>;
}
export declare class SetupGuideService {
    private readonly configService;
    private readonly prisma;
    private readonly emailService;
    private readonly eventEmitter;
    private readonly logger;
    private readonly setupSteps;
    constructor(configService: ConfigService, prisma: PrismaService, emailService: EmailService, eventEmitter: EventEmitter2);
    initializeSetup(userId: string): Promise<UserSetupProgress>;
    completeStep(userId: string, stepId: string, data?: Record<string, any>): Promise<UserSetupProgress>;
    skipStep(userId: string, stepId: string): Promise<UserSetupProgress>;
    getSetupProgress(userId: string): Promise<{
        currentStep: SetupStep;
        completedSteps: SetupStep[];
        remainingSteps: SetupStep[];
        progress: number;
        preferences: Record<string, any>;
    }>;
    private getNextStep;
    private handleSetupCompletion;
}
export {};
