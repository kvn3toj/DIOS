import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { UpdateConnectionCommand } from '../update-connection.command';
import { ConnectionRepository } from '../../repositories/connection.repository';
import { Connection } from '../../connection.entity';
import { ConnectionUpdatedEvent } from '../../events/connection-updated.event';

@CommandHandler(UpdateConnectionCommand)
export class UpdateConnectionHandler implements ICommandHandler<UpdateConnectionCommand> {
  constructor(
    private readonly connectionRepository: ConnectionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: UpdateConnectionCommand): Promise<Connection> {
    const { id, input } = command;
    
    // Update connection
    const connection = await this.connectionRepository.update(id, input);

    // Publish event
    this.eventBus.publish(
      new ConnectionUpdatedEvent(
        connection.id,
        connection.followerId,
        connection.followingId,
        connection.status,
        new Date(),
      ),
    );

    return connection;
  }
} 