import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateActivityCommand } from '../impl/create-activity.command';
import { ActivityRepository } from '../../repositories/activity.repository';
import { Activity } from '../../activity.entity';
import { ActivityCreatedEvent } from '../../events/impl/activity-created.event';

@CommandHandler(CreateActivityCommand)
export class CreateActivityHandler implements ICommandHandler<CreateActivityCommand> {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateActivityCommand): Promise<Activity> {
    const { input } = command;
    const activity = await this.repository.create(input);
    
    // Publish activity created event
    this.eventBus.publish(new ActivityCreatedEvent(activity));
    
    return activity;
  }
} 