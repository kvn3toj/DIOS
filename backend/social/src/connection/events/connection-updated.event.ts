import { IEvent } from '@nestjs/cqrs';
import { ConnectionStatus } from '../connection.entity';

export class ConnectionUpdatedEvent implements IEvent {
  constructor(
    public readonly connectionId: string,
    public readonly followerId: string,
    public readonly followingId: string,
    public readonly status: ConnectionStatus,
    public readonly timestamp: Date,
  ) {}
} 