import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UpdateActivityCommand } from '../impl/update-activity.command';
import { ActivityRepository } from '../../repositories/activity.repository';
import { Activity } from '../../activity.entity';
import { ActivityUpdatedEvent } from '../../events/impl/activity-updated.event';

@CommandHandler(UpdateActivityCommand)
export class UpdateActivityHandler implements ICommandHandler<UpdateActivityCommand> {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateActivityCommand): Promise<Activity> {
    const { id, input } = command;
    const activity = await this.repository.update(id, input);
    
    if (activity) {
      // Publish activity updated event
      this.eventBus.publish(new ActivityUpdatedEvent(activity));
    }
    
    return activity;
  }
} 