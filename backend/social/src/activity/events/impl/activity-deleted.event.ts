import { IEvent } from '@nestjs/cqrs';
import { Activity } from '../../activity.entity';

export class ActivityDeletedEvent implements IEvent {
  constructor(public readonly activity: Activity) {}
} 