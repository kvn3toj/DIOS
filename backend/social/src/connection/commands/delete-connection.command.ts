import { ICommand } from '@nestjs/cqrs';

export class DeleteConnectionCommand implements ICommand {
  constructor(public readonly id: string) {}
} 