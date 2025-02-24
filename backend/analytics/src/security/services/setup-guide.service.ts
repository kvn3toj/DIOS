import { Injectable, Logger } from '@nestjs/common';
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

@Injectable()
export class SetupGuideService {
  private readonly logger = new Logger(SetupGuideService.name);
  private readonly setupSteps: SetupStep[] = [
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

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async initializeSetup(userId: string): Promise<UserSetupProgress> {
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
    } catch (error) {
      this.logger.error('Failed to initialize setup:', error);
      throw error;
    }
  }

  async completeStep(userId: string, stepId: string, data?: Record<string, any>): Promise<UserSetupProgress> {
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

      // Update preferences if data is provided
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
    } catch (error) {
      this.logger.error('Failed to complete setup step:', error);
      throw error;
    }
  }

  async skipStep(userId: string, stepId: string): Promise<UserSetupProgress> {
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
    } catch (error) {
      this.logger.error('Failed to skip setup step:', error);
      throw error;
    }
  }

  async getSetupProgress(userId: string): Promise<{
    currentStep: SetupStep;
    completedSteps: SetupStep[];
    remainingSteps: SetupStep[];
    progress: number;
    preferences: Record<string, any>;
  }> {
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
    } catch (error) {
      this.logger.error('Failed to get setup progress:', error);
      throw error;
    }
  }

  private getNextStep(currentStepId: string): SetupStep | undefined {
    const currentStep = this.setupSteps.find(s => s.id === currentStepId);
    if (!currentStep) return undefined;

    return this.setupSteps.find(s => s.order > currentStep.order);
  }

  private async handleSetupCompletion(userId: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Update user profile with completed setup
      await this.prisma.user.update({
        where: { id: userId },
        data: { hasCompletedSetup: true },
      });

      this.eventEmitter.emit('setup.completed', {
        userId,
        timestamp: new Date(),
      });
    } catch (error) {
      this.logger.error('Failed to handle setup completion:', error);
      throw error;
    }
  }
} 