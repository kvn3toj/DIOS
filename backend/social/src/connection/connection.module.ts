import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Connection } from './connection.entity';
import { ConnectionRepository } from './repositories/connection.repository';
import { ConnectionService } from './connection.service';
import { ConnectionResolver } from './connection.resolver';
import { EventBusModule } from '../eventbus/eventbus.module';

// Command Handlers
import { CreateConnectionHandler } from './commands/handlers/create-connection.handler';
import { UpdateConnectionHandler } from './commands/handlers/update-connection.handler';
import { DeleteConnectionHandler } from './commands/handlers/delete-connection.handler';

// Event Handlers
import { ConnectionCreatedHandler } from './events/handlers/connection-created.handler';
import { ConnectionUpdatedHandler } from './events/handlers/connection-updated.handler';
import { ConnectionDeletedHandler } from './events/handlers/connection-deleted.handler';

const CommandHandlers = [
  CreateConnectionHandler,
  UpdateConnectionHandler,
  DeleteConnectionHandler,
];

const EventHandlers = [
  ConnectionCreatedHandler,
  ConnectionUpdatedHandler,
  ConnectionDeletedHandler,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([Connection]),
    CqrsModule,
    EventBusModule,
  ],
  providers: [
    ConnectionRepository,
    ConnectionService,
    ConnectionResolver,
    ...CommandHandlers,
    ...EventHandlers,
  ],
  exports: [ConnectionService],
})
export class ConnectionModule {} 