import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ActivityDeletedEvent } from '../impl/activity-deleted.event';
import { ProfileService } from '../../../profile/profile.service';

@EventsHandler(ActivityDeletedEvent)
export class ActivityDeletedHandler implements IEventHandler<ActivityDeletedEvent> {
  constructor(private readonly profileService: ProfileService) {}

  async handle(event: ActivityDeletedEvent) {
    const { activity } = event;
    
    // Update profile's activity count
    await this.profileService.updateActivityCount(activity.profileId);
  }
} 