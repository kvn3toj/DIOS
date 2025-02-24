import { IEvent } from '@nestjs/cqrs';

export class ConnectionCreatedEvent implements IEvent {
  constructor(
    public readonly connectionId: string,
    public readonly followerId: string,
    public readonly followingId: string,
    public readonly timestamp: Date,
  ) {}
} 