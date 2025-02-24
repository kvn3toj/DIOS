import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FeatureLifecycle, FeatureState } from './entities/feature-lifecycle.entity';
import { FeatureFlag } from '../feature-flags/entities/feature-flag.entity';

@Injectable()
export class FeatureLifecycleService {
  constructor(
    @InjectRepository(FeatureLifecycle)
    private lifecycleRepository: Repository<FeatureLifecycle>,
    @InjectRepository(FeatureFlag)
    private featureFlagRepository: Repository<FeatureFlag>
  ) {}

  async createLifecycle(featureId: string): Promise<FeatureLifecycle> {
    const feature = await this.featureFlagRepository.findOne({ where: { id: featureId } });
    if (!feature) {
      throw new NotFoundException(`Feature flag with ID "${featureId}" not found`);
    }

    const lifecycle = this.lifecycleRepository.create({
      feature,
      state: FeatureState.DEVELOPMENT,
      stateMetadata: {
        enteredAt: new Date(),
        criteria: [],
        approvedBy: ''
      },
      usageMetrics: {
        dailyActiveUsers: 0,
        weeklyActiveUsers: 0,
        monthlyActiveUsers: 0,
        errorRate: 0,
        latency: 0,
        lastUpdated: new Date()
      }
    });

    return this.lifecycleRepository.save(lifecycle);
  }

  async updateState(id: string, newState: FeatureState, approver: string): Promise<FeatureLifecycle> {
    const lifecycle = await this.lifecycleRepository.findOne({ 
      where: { id },
      relations: ['feature', 'dependencies']
    });
    
    if (!lifecycle) {
      throw new NotFoundException(`Feature lifecycle with ID "${id}" not found`);
    }

    // Validate state transition
    if (!this.isValidStateTransition(lifecycle.state, newState)) {
      throw new BadRequestException(`Invalid state transition from ${lifecycle.state} to ${newState}`);
    }

    // Check dependencies for state transition
    if (newState === FeatureState.GA) {
      await this.validateDependenciesForGA(lifecycle);
    }

    lifecycle.state = newState;
    lifecycle.stateMetadata = {
      enteredAt: new Date(),
      criteria: this.getStateEntryCriteria(newState),
      approvedBy: approver
    };

    return this.lifecycleRepository.save(lifecycle);
  }

  async addDependency(id: string, dependencyId: string): Promise<FeatureLifecycle> {
    const [lifecycle, dependency] = await Promise.all([
      this.lifecycleRepository.findOne({ 
        where: { id },
        relations: ['dependencies']
      }),
      this.featureFlagRepository.findOne({ where: { id: dependencyId } })
    ]);

    if (!lifecycle || !dependency) {
      throw new NotFoundException('Feature lifecycle or dependency not found');
    }

    // Check for circular dependencies
    if (await this.hasCircularDependency(lifecycle.id, dependencyId)) {
      throw new BadRequestException('Adding this dependency would create a circular reference');
    }

    lifecycle.dependencies = [...(lifecycle.dependencies || []), dependency];
    return this.lifecycleRepository.save(lifecycle);
  }

  async updateMigrationPlan(id: string, steps: string[], targetDate: Date): Promise<FeatureLifecycle> {
    const lifecycle = await this.lifecycleRepository.findOne({ where: { id } });
    if (!lifecycle) {
      throw new NotFoundException(`Feature lifecycle with ID "${id}" not found`);
    }

    lifecycle.migrationPlan = {
      steps: steps.map(description => ({ description })),
      targetDate
    };

    return this.lifecycleRepository.save(lifecycle);
  }

  async updateCleanupStrategy(
    id: string,
    steps: string[],
    codeRefs: string[],
    dataRefs: string[],
    targetDate: Date
  ): Promise<FeatureLifecycle> {
    const lifecycle = await this.lifecycleRepository.findOne({ where: { id } });
    if (!lifecycle) {
      throw new NotFoundException(`Feature lifecycle with ID "${id}" not found`);
    }

    lifecycle.cleanupStrategy = {
      steps,
      codeReferences: codeRefs,
      dataReferences: dataRefs,
      targetDate
    };

    return this.lifecycleRepository.save(lifecycle);
  }

  async updateUsageMetrics(id: string, metrics: Partial<FeatureLifecycle['usageMetrics']>): Promise<FeatureLifecycle> {
    const lifecycle = await this.lifecycleRepository.findOne({ where: { id } });
    if (!lifecycle) {
      throw new NotFoundException(`Feature lifecycle with ID "${id}" not found`);
    }

    lifecycle.usageMetrics = {
      ...lifecycle.usageMetrics,
      ...metrics,
      lastUpdated: new Date()
    };

    return this.lifecycleRepository.save(lifecycle);
  }

  async updateVersionControl(
    id: string,
    currentVersion: string,
    minVersion: string,
    breakingChanges: Array<{ version: string; description: string; date: Date }>
  ): Promise<FeatureLifecycle> {
    const lifecycle = await this.lifecycleRepository.findOne({ where: { id } });
    if (!lifecycle) {
      throw new NotFoundException(`Feature lifecycle with ID "${id}" not found`);
    }

    lifecycle.versionControl = {
      currentVersion,
      minimumSupportedVersion: minVersion,
      breakingChanges
    };

    return this.lifecycleRepository.save(lifecycle);
  }

  private isValidStateTransition(currentState: FeatureState, newState: FeatureState): boolean {
    const validTransitions = {
      [FeatureState.DEVELOPMENT]: [FeatureState.ALPHA],
      [FeatureState.ALPHA]: [FeatureState.BETA, FeatureState.DEVELOPMENT],
      [FeatureState.BETA]: [FeatureState.GA, FeatureState.ALPHA],
      [FeatureState.GA]: [FeatureState.DEPRECATED],
      [FeatureState.DEPRECATED]: [FeatureState.SUNSET],
      [FeatureState.SUNSET]: []
    };

    return validTransitions[currentState].includes(newState);
  }

  private async validateDependenciesForGA(lifecycle: FeatureLifecycle): Promise<void> {
    if (!lifecycle.dependencies?.length) {
      return;
    }

    const nonGADependencies = await this.lifecycleRepository
      .createQueryBuilder('lifecycle')
      .innerJoin('lifecycle.feature', 'feature')
      .where('feature.id IN (:...ids)', { 
        ids: lifecycle.dependencies.map(d => d.id) 
      })
      .andWhere('lifecycle.state != :gaState', { gaState: FeatureState.GA })
      .getCount();

    if (nonGADependencies > 0) {
      throw new BadRequestException('All dependencies must be in GA state before promoting to GA');
    }
  }

  private async hasCircularDependency(sourceId: string, targetId: string, visited = new Set<string>()): Promise<boolean> {
    if (visited.has(targetId)) {
      return true;
    }

    visited.add(targetId);
    const target = await this.lifecycleRepository.findOne({
      where: { id: targetId },
      relations: ['dependencies']
    });

    if (!target?.dependencies?.length) {
      return false;
    }

    for (const dependency of target.dependencies) {
      if (dependency.id === sourceId || await this.hasCircularDependency(sourceId, dependency.id, visited)) {
        return true;
      }
    }

    return false;
  }

  private getStateEntryCriteria(state: FeatureState): string[] {
    const criteria = {
      [FeatureState.ALPHA]: [
        'Basic functionality implemented',
        'Unit tests written',
        'Documentation started'
      ],
      [FeatureState.BETA]: [
        'All core functionality implemented',
        'Integration tests complete',
        'Documentation complete',
        'Performance benchmarks established'
      ],
      [FeatureState.GA]: [
        'All tests passing',
        'Documentation reviewed and approved',
        'Performance requirements met',
        'Security review complete',
        'Load testing complete'
      ],
      [FeatureState.DEPRECATED]: [
        'Replacement feature identified',
        'Migration guide published',
        'Timeline communicated'
      ],
      [FeatureState.SUNSET]: [
        'All users migrated',
        'No active usage',
        'Cleanup plan approved'
      ]
    };

    return criteria[state] || [];
  }
} 