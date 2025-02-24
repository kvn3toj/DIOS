import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { DeleteConnectionCommand } from '../delete-connection.command';
import { ConnectionRepository } from '../../repositories/connection.repository';
import { ConnectionDeletedEvent } from '../../events/connection-deleted.event';

@CommandHandler(DeleteConnectionCommand)
export class DeleteConnectionHandler implements ICommandHandler<DeleteConnectionCommand> {
  constructor(
    private readonly connectionRepository: ConnectionRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: DeleteConnectionCommand): Promise<boolean> {
    const { id } = command;
    
    // Get connection before deletion for event data
    const connection = await this.connectionRepository.findById(id);
    if (!connection) {
      return false;
    }

    // Delete connection
    const result = await this.connectionRepository.delete(id);

    if (result) {
      // Publish event
      this.eventBus.publish(
        new ConnectionDeletedEvent(
          id,
          connection.followerId,
          connection.followingId,
          new Date(),
        ),
      );
    }

    return result;
  }
} 