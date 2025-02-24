import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Profile } from './profile.entity';
import { CreateProfileInput } from './dto/create-profile.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { CreateProfileCommand } from './commands/create-profile.command';
import { GetProfileQuery } from './queries/get-profile.query';
import { GetProfilesQuery } from './queries/get-profiles.query';
import { UpdateProfileCommand } from './commands/update-profile.command';
import { DeleteProfileCommand } from './commands/delete-profile.command';
import { AddBadgeCommand } from './commands/add-badge.command';

@Injectable()
export class ProfileService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async create(createProfileInput: CreateProfileInput): Promise<Profile> {
    return this.commandBus.execute(new CreateProfileCommand(createProfileInput));
  }

  async findAll(): Promise<Profile[]> {
    return this.queryBus.execute(new GetProfilesQuery());
  }

  async findOne(id: string): Promise<Profile> {
    return this.queryBus.execute(new GetProfileQuery(id));
  }

  async findByUserId(userId: string): Promise<Profile> {
    return this.queryBus.execute(new GetProfileQuery(undefined, userId));
  }

  async update(id: string, updateProfileInput: UpdateProfileInput): Promise<Profile> {
    return this.commandBus.execute(new UpdateProfileCommand(id, updateProfileInput));
  }

  async remove(id: string): Promise<boolean> {
    return this.commandBus.execute(new DeleteProfileCommand(id));
  }

  async updateLastSeen(id: string): Promise<Profile> {
    return this.commandBus.execute(
      new UpdateProfileCommand(id, { lastSeenAt: new Date() })
    );
  }

  async addBadge(id: string, badge: string): Promise<Profile> {
    return this.commandBus.execute(new AddBadgeCommand(id, badge));
  }

  async updateConnectionCount(id: string, increment: boolean = true): Promise<Profile> {
    return this.commandBus.execute(
      new UpdateProfileCommand(id, {
        connectionCount: increment ? { increment: 1 } : { decrement: 1 }
      })
    );
  }

  async updateActivityCount(id: string): Promise<Profile> {
    return this.commandBus.execute(
      new UpdateProfileCommand(id, { activityCount: { refresh: true } })
    );
  }
} 