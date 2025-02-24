import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ActivityInteractionUpdatedEvent } from '../impl/activity-interaction-updated.event';

@EventsHandler(ActivityInteractionUpdatedEvent)
export class ActivityInteractionUpdatedHandler implements IEventHandler<ActivityInteractionUpdatedEvent> {
  async handle(event: ActivityInteractionUpdatedEvent) {
    // Handle any side effects of interaction updates
    // For example, notify relevant services or update caches
  }
} 