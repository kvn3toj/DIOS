import { ICommand } from '@nestjs/cqrs';
import { UpdateActivityInput } from '../../dto/update-activity.input';

export class UpdateActivityCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly input: UpdateActivityInput,
  ) {}
} 