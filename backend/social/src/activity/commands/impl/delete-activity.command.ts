import { ICommand } from '@nestjs/cqrs';

export class DeleteActivityCommand implements ICommand {
  constructor(public readonly id: string) {}
} 