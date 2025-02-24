import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { IncrementInteractionCommand } from '../impl/increment-interaction.command';
import { ActivityRepository } from '../../repositories/activity.repository';
import { ActivityInteractionUpdatedEvent } from '../../events/impl/activity-interaction-updated.event';

@CommandHandler(IncrementInteractionCommand)
export class IncrementInteractionHandler implements ICommandHandler<IncrementInteractionCommand> {
  constructor(
    private readonly repository: ActivityRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: IncrementInteractionCommand): Promise<void> {
    const { id, field } = command;
    await this.repository.incrementInteractionCount(id, field);
    
    const activity = await this.repository.findById(id);
    if (activity) {
      // Publish interaction updated event
      this.eventBus.publish(new ActivityInteractionUpdatedEvent(activity, field, 'increment'));
    }
  }
} 