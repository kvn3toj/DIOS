import { IEvent } from '@nestjs/cqrs';

export class ProfileCreatedEvent implements IEvent {
  constructor(
    public readonly profileId: string,
    public readonly userId: string,
    public readonly timestamp: Date,
  ) {}
} 