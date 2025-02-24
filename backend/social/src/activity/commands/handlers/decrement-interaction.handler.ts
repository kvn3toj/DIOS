import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { DecrementInteractionCommand } from '../impl/decrement-interaction.command';
import { ActivityRepository } from '../../repositories/activity.repository';
import { ActivityInteractionUpdatedEvent } from '../../events/impl/activity-interaction-updated.event';

@CommandHandler(DecrementInteractionCommand)
export class DecrementInteractionHandler implements ICommandHandler<DecrementInteractionCommand> {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DecrementInteractionCommand): Promise<void> {
    const { id, field } = command;
    await this.repository.decrementInteractionCount(id, field);
    
    const activity = await this.repository.findById(id);
    if (activity) {
      // Publish interaction updated event
      this.eventBus.publish(new ActivityInteractionUpdatedEvent(activity, field, 'decrement'));
    }
  }
} 