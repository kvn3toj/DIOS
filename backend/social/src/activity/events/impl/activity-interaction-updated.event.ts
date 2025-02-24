import { IEvent } from '@nestjs/cqrs';
import { Activity } from '../../activity.entity';

export class ActivityInteractionUpdatedEvent implements IEvent {
  constructor(
    public readonly activity: Activity,
    public readonly field: 'likesCount' | 'commentsCount' | 'sharesCount',
    public readonly action: 'increment' | 'decrement'
  ) {}
} 