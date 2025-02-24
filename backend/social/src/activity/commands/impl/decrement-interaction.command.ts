import { ICommand } from '@nestjs/cqrs';

export class DecrementInteractionCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly field: 'likesCount' | 'commentsCount' | 'sharesCount',
  ) {}
}
