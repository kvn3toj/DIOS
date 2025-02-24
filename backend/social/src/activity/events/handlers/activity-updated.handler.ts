import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ActivityUpdatedEvent } from '../impl/activity-updated.event';

@EventsHandler(ActivityUpdatedEvent)
export class ActivityUpdatedHandler implements IEventHandler<ActivityUpdatedEvent> {
  async handle(event: ActivityUpdatedEvent) {
    // Handle any side effects of activity updates
    // For example, notify relevant services or update caches
  }
} 