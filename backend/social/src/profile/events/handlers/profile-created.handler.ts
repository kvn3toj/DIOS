import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ProfileCreatedEvent } from '../profile-created.event';

@EventsHandler(ProfileCreatedEvent)
export class ProfileCreatedHandler implements IEventHandler<ProfileCreatedEvent> {
  constructor(
    @Inject('EVENT_BUS') private readonly eventBus: ClientProxy,
  ) {}

  async handle(event: ProfileCreatedEvent) {
    // Emit event to the message broker
    this.eventBus.emit('profile.created', {
      profileId: event.profileId,
      userId: event.userId,
      timestamp: event.timestamp,
    });

    // Additional handling like notifications, analytics, etc.
    // This could include:
    // - Sending welcome notifications
    // - Updating analytics
    // - Triggering initial achievements
    // - Creating default connections
  }
} 