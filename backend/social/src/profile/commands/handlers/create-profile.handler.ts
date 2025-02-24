import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileCommand } from '../create-profile.command';
import { Profile } from '../../profile.entity';
import { ProfileCreatedEvent } from '../../events/profile-created.event';

@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler implements ICommandHandler<CreateProfileCommand> {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    private eventBus: EventBus,
  ) {}

  async execute(command: CreateProfileCommand): Promise<Profile> {
    const { input } = command;
    
    // Create new profile
    const profile = this.profileRepository.create(input);
    const savedProfile = await this.profileRepository.save(profile);

    // Publish event
    this.eventBus.publish(
      new ProfileCreatedEvent(
        savedProfile.id,
        savedProfile.userId,
        new Date(),
      ),
    );

    return savedProfile;
  }
} 