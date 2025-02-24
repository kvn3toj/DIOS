import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConnectionUpdatedEvent } from '../connection-updated.event';

@EventsHandler(ConnectionUpdatedEvent)
export class ConnectionUpdatedHandler implements IEventHandler<ConnectionUpdatedEvent> {
  constructor(
    @Inject('EVENT_BUS')
    private readonly eventBus: ClientProxy,
  ) {}

  async handle(event: ConnectionUpdatedEvent) {
    // Emit event to the event bus for other services
    this.eventBus.emit('connection.updated', {
      connectionId: event.connectionId,
      followerId: event.followerId,
      followingId: event.followingId,
      status: event.status,
      timestamp: event.timestamp,
    });

    // Additional handling like updating profile connection counts
    // based on status changes can be implemented here or in a separate saga
  }
} 