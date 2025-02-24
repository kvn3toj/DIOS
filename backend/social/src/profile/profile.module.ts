import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProfileService } from './profile.service';
import { ProfileResolver } from './profile.resolver';
import { Profile } from './profile.entity';
import { EventBusModule } from '../eventbus/eventbus.module';
import { ConnectionModule } from '../connection/connection.module';
import { ActivityModule } from '../activity/activity.module';

// Command Handlers
import { CreateProfileHandler } from './commands/handlers/create-profile.handler';

// Event Handlers
import { ProfileCreatedHandler } from './events/handlers/profile-created.handler';

const CommandHandlers = [CreateProfileHandler];
const EventHandlers = [ProfileCreatedHandler];

@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]),
    CqrsModule,
    ClientsModule.register([
      {
        name: 'EVENT_BUS',
        transport: Transport.REDIS,
        options: {
          url: process.env.REDIS_URL,
        },
      },
    ]),
    EventBusModule,
    ConnectionModule,
    ActivityModule,
  ],
  providers: [
    ProfileService,
    ProfileResolver,
    ...CommandHandlers,
    ...EventHandlers,
  ],
  exports: [ProfileService],
})
export class ProfileModule {} 