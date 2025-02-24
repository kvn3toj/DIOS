import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class WelcomeService {
  private readonly logger = new Logger(WelcomeService.name);
  private readonly onboardingSteps: OnboardingStep[] = [
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

  constructor(
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async initializeOnboarding(userId: string): Promise<UserOnboarding> {
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

      // Send welcome email with first step
      await this.emailService.sendWelcomeEmail(user.email, {
        name: user.name,
        firstStep: this.onboardingSteps[0],
      });

      this.eventEmitter.emit('onboarding.initialized', {
        userId,
        timestamp: new Date(),
      });

      return onboarding;
    } catch (error) {
      this.logger.error('Failed to initialize onboarding:', error);
      throw error;
    }
  }

  async completeStep(userId: string, stepId: string): Promise<UserOnboarding> {
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
    } catch (error) {
      this.logger.error('Failed to complete onboarding step:', error);
      throw error;
    }
  }

  async skipStep(userId: string, stepId: string): Promise<UserOnboarding> {
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
    } catch (error) {
      this.logger.error('Failed to skip onboarding step:', error);
      throw error;
    }
  }

  async getOnboardingProgress(userId: string): Promise<{
    currentStep: OnboardingStep;
    completedSteps: OnboardingStep[];
    remainingSteps: OnboardingStep[];
    progress: number;
  }> {
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
    } catch (error) {
      this.logger.error('Failed to get onboarding progress:', error);
      throw error;
    }
  }

  private getNextStep(currentStepId: string): OnboardingStep | undefined {
    const currentStep = this.onboardingSteps.find(s => s.id === currentStepId);
    if (!currentStep) return undefined;

    return this.onboardingSteps.find(s => s.order > currentStep.order);
  }

  private async handleOnboardingCompletion(userId: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Send completion email
      await this.emailService.sendOnboardingCompletionEmail(user.email, {
        name: user.name,
      });

      this.eventEmitter.emit('onboarding.completed', {
        userId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to handle onboarding completion:', error);
      throw error;
    }
  }
} 