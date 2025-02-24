import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Profile } from './profile.entity';
import { ProfileService } from './profile.service';
import { CreateProfileInput } from './dto/create-profile.input';
import { UpdateProfileInput } from './dto/update-profile.input';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { Connection } from '../connection/connection.entity';
import { Activity } from '../activity/activity.entity';
import { ConnectionService } from '../connection/connection.service';
import { ActivityService } from '../activity/activity.service';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(
    private readonly profileService: ProfileService,
    private readonly connectionService: ConnectionService,
    private readonly activityService: ActivityService,
  ) {}

  @Query(() => [Profile])
  @UseGuards(GqlAuthGuard)
  async profiles(): Promise<Profile[]> {
    return this.profileService.findAll();
  }

  @Query(() => Profile)
  @UseGuards(GqlAuthGuard)
  async profile(@Args('id') id: string): Promise<Profile> {
    return this.profileService.findOne(id);
  }

  @Query(() => Profile)
  @UseGuards(GqlAuthGuard)
  async profileByUserId(@Args('userId') userId: string): Promise<Profile> {
    return this.profileService.findByUserId(userId);
  }

  @Mutation(() => Profile)
  @UseGuards(GqlAuthGuard)
  async createProfile(
    @Args('createProfileInput') createProfileInput: CreateProfileInput,
  ): Promise<Profile> {
    return this.profileService.create(createProfileInput);
  }

  @Mutation(() => Profile)
  @UseGuards(GqlAuthGuard)
  async updateProfile(
    @Args('id') id: string,
    @Args('updateProfileInput') updateProfileInput: UpdateProfileInput,
  ): Promise<Profile> {
    return this.profileService.update(id, updateProfileInput);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeProfile(@Args('id') id: string): Promise<boolean> {
    return this.profileService.remove(id);
  }

  @Mutation(() => Profile)
  @UseGuards(GqlAuthGuard)
  async addBadgeToProfile(
    @Args('id') id: string,
    @Args('badge') badge: string,
  ): Promise<Profile> {
    return this.profileService.addBadge(id, badge);
  }

  @ResolveField(() => [Connection])
  async connections(@Parent() profile: Profile): Promise<Connection[]> {
    return this.connectionService.findByProfileId(profile.id);
  }

  @ResolveField(() => [Activity])
  async activities(@Parent() profile: Profile): Promise<Activity[]> {
    return this.activityService.findByProfileId(profile.id);
  }

  @ResolveField(() => Number)
  async connectionCount(@Parent() profile: Profile): Promise<number> {
    return profile.connectionCount;
  }

  @ResolveField(() => Number)
  async activityCount(@Parent() profile: Profile): Promise<number> {
    return profile.activityCount;
  }

  @ResolveField(() => Boolean)
  async isOnline(@Parent() profile: Profile): Promise<boolean> {
    const lastSeen = profile.lastSeenAt;
    if (!lastSeen) return false;
    
    // Consider online if last seen within the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return lastSeen > fiveMinutesAgo;
  }
} 