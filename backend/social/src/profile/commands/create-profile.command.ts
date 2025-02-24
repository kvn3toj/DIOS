import { ICommand } from '@nestjs/cqrs';
import { CreateProfileInput } from '../dto/create-profile.input';

export class CreateProfileCommand implements ICommand {
  constructor(public readonly input: CreateProfileInput) {}
} 