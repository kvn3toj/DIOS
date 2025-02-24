import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ActivityCreatedEvent } from '../impl/activity-created.event';
import { ProfileService } from '../../../profile/profile.service';

@EventsHandler(ActivityCreatedEvent)
export class ActivityCreatedHandler implements IEventHandler<ActivityCreatedEvent> {
  constructor(private readonly profileService: ProfileService) {}

  async handle(event: ActivityCreatedEvent) {
    const { activity } = event;
    
    // Update profile's activity count
    await this.profileService.updateActivityCount(activity.profileId);
  }
} 