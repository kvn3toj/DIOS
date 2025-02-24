import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ConnectionCreatedEvent } from '../connection-created.event';

@EventsHandler(ConnectionCreatedEvent)
export class ConnectionCreatedHandler implements IEventHandler<ConnectionCreatedEvent> {
  constructor(
    @Inject('EVENT_BUS')
    private readonly eventBus: ClientProxy,
  ) {}

  async handle(event: ConnectionCreatedEvent) {
    // Emit event to the event bus for other services
    this.eventBus.emit('connection.created', {
      connectionId: event.connectionId,
      followerId: event.followerId,
      followingId: event.followingId,
      timestamp: event.timestamp,
    });

    // Additional handling like updating profile connection counts
    // can be implemented here or in a separate saga
  }
} 