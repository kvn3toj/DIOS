import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConnectionDeletedEvent } from '../connection-deleted.event';

@EventsHandler(ConnectionDeletedEvent)
export class ConnectionDeletedHandler implements IEventHandler<ConnectionDeletedEvent> {
  constructor(
    @Inject('EVENT_BUS')
    private readonly eventBus: ClientProxy,
  ) {}

  async handle(event: ConnectionDeletedEvent) {
    // Emit event to the event bus for other services
    this.eventBus.emit('connection.deleted', {
      connectionId: event.connectionId,
      followerId: event.followerId,
      followingId: event.followingId,
      timestamp: event.timestamp,
    });

    // Additional handling like updating profile connection counts
    // can be implemented here or in a separate saga
  }
} 