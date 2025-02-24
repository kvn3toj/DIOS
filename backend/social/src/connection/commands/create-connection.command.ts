import { ICommand } from '@nestjs/cqrs';
import { CreateConnectionInput } from '../dto/create-connection.input';

export class CreateConnectionCommand implements ICommand {
  constructor(public readonly input: CreateConnectionInput) {}
} 