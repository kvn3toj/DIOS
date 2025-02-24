import { ICommand } from '@nestjs/cqrs';
import { UpdateConnectionInput } from '../dto/update-connection.input';

export class UpdateConnectionCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateConnectionInput,
  ) {}
} 