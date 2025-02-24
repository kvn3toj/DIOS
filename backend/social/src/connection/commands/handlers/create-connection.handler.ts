import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { CreateConnectionCommand } from '../create-connection.command';
import { ConnectionRepository } from '../../repositories/connection.repository';
import { Connection } from '../../connection.entity';
import { ConnectionCreatedEvent } from '../../events/connection-created.event';

@CommandHandler(CreateConnectionCommand)
export class CreateConnectionHandler implements ICommandHandler<CreateConnectionCommand> {
  constructor(
    private readonly connectionRepository: ConnectionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: CreateConnectionCommand): Promise<Connection> {
    const { input } = command;
    
    // Create new connection
    const connection = await this.connectionRepository.create(input);

    // Publish event
    this.eventBus.publish(
      new ConnectionCreatedEvent(
        connection.id,
        connection.followerId,
        connection.followingId,
        new Date(),
      ),
    );

    return connection;
  }
} 