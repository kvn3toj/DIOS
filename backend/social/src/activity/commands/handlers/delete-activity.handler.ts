import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { DeleteActivityCommand } from '../impl/delete-activity.command';
import { ActivityRepository } from '../../repositories/activity.repository';
import { ActivityDeletedEvent } from '../../events/impl/activity-deleted.event';

@CommandHandler(DeleteActivityCommand)
export class DeleteActivityHandler implements ICommandHandler<DeleteActivityCommand> {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteActivityCommand): Promise<boolean> {
    const { id } = command;
    const activity = await this.repository.findById(id);
    
    if (activity) {
      const deleted = await this.repository.delete(id);
      if (deleted) {
        // Publish activity deleted event
        this.eventBus.publish(new ActivityDeletedEvent(activity));
      }
      return deleted;
    }
    
    return false;
  }
}