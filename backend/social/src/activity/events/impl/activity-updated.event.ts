import { IEvent } from '@nestjs/cqrs';
import { Activity } from '../../activity.entity';

export class ActivityUpdatedEvent implements IEvent {
  constructor(public readonly activity: Activity) {}
} 