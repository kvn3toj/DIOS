import { IEvent } from '@nestjs/cqrs';
import { Activity } from '../../activity.entity';

export class ActivityCreatedEvent implements IEvent {
  constructor(public readonly activity: Activity) {}
} 