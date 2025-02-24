import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Activity } from './activity.entity';
import { ActivityRepository } from './repositories/activity.repository';
import { ActivityService } from './activity.service';
import { ActivityResolver } from './activity.resolver';
import { EventBusModule } from '../eventbus/eventbus.module';

// Command Handlers
import { CreateActivityHandler } from './commands/handlers/create-activity.handler';
import { UpdateActivityHandler } from './commands/handlers/update-activity.handler';
import { DeleteActivityHandler } from './commands/handlers/delete-activity.handler';
import { IncrementInteractionHandler } from './commands/handlers/increment-interaction.handler';
import { DecrementInteractionHandler } from './commands/handlers/decrement-interaction.handler';

// Event Handlers
import { ActivityCreatedHandler } from './events/handlers/activity-created.handler';
import { ActivityUpdatedHandler } from './events/handlers/activity-updated.handler';
import { ActivityDeletedHandler } from './events/handlers/activity-deleted.handler';
import { ActivityInteractionUpdatedHandler } from './events/handlers/activity-interaction-updated.handler';

const CommandHandlers = [
  CreateActivityHandler,
  UpdateActivityHandler,
  DeleteActivityHandler,
  IncrementInteractionHandler,
  DecrementInteractionHandler,
];

const EventHandlers = [
  ActivityCreatedHandler,
  ActivityUpdatedHandler,
  ActivityDeletedHandler,
  ActivityInteractionUpdatedHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Activity]),
    CqrsModule,
    EventBusModule,
  ],
  providers: [
    ActivityRepository,
    ActivityService,
    ActivityResolver,
    ...CommandHandlers,
    ...EventHandlers,
  ],
  exports: [ActivityService],
})
export class ActivityModule {} 