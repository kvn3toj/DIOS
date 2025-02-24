import { ICommand } from '@nestjs/cqrs';
import { CreateActivityInput } from '../../dto/create-activity.input';

export class CreateActivityCommand implements ICommand {
  constructor(public readonly input: CreateActivityInput) {}
} 