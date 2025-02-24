import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ActivityRepository } from './repositories/activity.repository';
import { Activity, ActivityType, ActivityVisibility } from './activity.entity';
import { CreateActivityInput } from './dto/create-activity.input';
import { UpdateActivityInput } from './dto/update-activity.input';
import { CreateActivityCommand } from './commands/impl/create-activity.command';
import { UpdateActivityCommand } from './commands/impl/update-activity.command';
import { DeleteActivityCommand } from './commands/impl/delete-activity.command';
import { IncrementInteractionCommand } from './commands/impl/increment-interaction.command';
import { DecrementInteractionCommand } from './commands/impl/decrement-interaction.command';

@Injectable()
export class ActivityService {
  constructor(
    private readonly activityRepository: ActivityRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(input: CreateActivityInput): Promise<Activity> {
    return this.commandBus.execute(new CreateActivityCommand(input));
  }

  async findById(id: string): Promise<Activity> {
    return this.activityRepository.findById(id);
  }

  async findByProfileId(
    profileId: string,
    options: {
      type?: ActivityType;
      visibility?: ActivityVisibility;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Activity[]> {
    return this.activityRepository.findByProfileId(profileId, options);
  }

  async findByProfileIds(
    profileIds: string[],
    options: {
      type?: ActivityType;
      visibility?: ActivityVisibility;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Activity[]> {
    return this.activityRepository.findByProfileIds(profileIds, options);
  }

  async findByTargetId(
    targetId: string,
    options: {
      type?: ActivityType;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Activity[]> {
    return this.activityRepository.findByTargetId(targetId, options);
  }

  async update(id: string, input: UpdateActivityInput): Promise<Activity> {
    return this.commandBus.execute(new UpdateActivityCommand(id, input));
  }

  async delete(id: string): Promise<boolean> {
    return this.commandBus.execute(new DeleteActivityCommand(id));
  }

  async incrementInteraction(
    id: string,
    field: 'likesCount' | 'commentsCount' | 'sharesCount'
  ): Promise<void> {
    await this.commandBus.execute(new IncrementInteractionCommand(id, field));
  }

  async decrementInteraction(
    id: string,
    field: 'likesCount' | 'commentsCount' | 'sharesCount'
  ): Promise<void> {
    await this.commandBus.execute(new DecrementInteractionCommand(id, field));
  }

  async countByProfileId(
    profileId: string,
    options: {
      type?: ActivityType;
      visibility?: ActivityVisibility;
    } = {}
  ): Promise<number> {
    return this.activityRepository.countByProfileId(profileId, options);
  }

  async getFeed(
    profileId: string,
    connectionIds: string[],
    options: {
      limit?: number;
      offset?: number;
      visibility?: ActivityVisibility[];
    } = {}
  ): Promise<Activity[]> {
    const { limit = 10, offset = 0, visibility = [ActivityVisibility.PUBLIC] } = options;
    
    const allProfileIds = [profileId, ...connectionIds];
    return this.activityRepository.findByProfileIds(allProfileIds, {
      visibility: visibility[0], // Using first visibility as default
      limit,
      offset,
    });
  }
} 