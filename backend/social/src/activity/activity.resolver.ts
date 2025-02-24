import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Activity, ActivityType, ActivityVisibility } from './activity.entity';
import { ActivityService } from './activity.service';
import { CreateActivityInput } from './dto/create-activity.input';
import { UpdateActivityInput } from './dto/update-activity.input';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { Profile } from '../profile/profile.entity';
import { ProfileService } from '../profile/profile.service';

@Resolver(() => Activity)
export class ActivityResolver {
  constructor(
    private readonly activityService: ActivityService,
    private readonly profileService: ProfileService,
  ) {}

  @Query(() => [Activity])
  @UseGuards(GqlAuthGuard)
  async activities(
    @Args('profileId') profileId: string,
    @Args('type', { nullable: true }) type?: ActivityType,
    @Args('visibility', { nullable: true }) visibility?: ActivityVisibility,
    @Args('limit', { nullable: true }) limit?: number,
    @Args('offset', { nullable: true }) offset?: number,
  ): Promise<Activity[]> {
    return this.activityService.findByProfileId(profileId, { type, visibility, limit, offset });
  }

  @Query(() => Activity)
  @UseGuards(GqlAuthGuard)
  async activity(@Args('id') id: string): Promise<Activity> {
    return this.activityService.findById(id);
  }

  @Query(() => [Activity])
  @UseGuards(GqlAuthGuard)
  async activityFeed(
    @Args('profileId') profileId: string,
    @Args('connectionIds', { type: () => [String] }) connectionIds: string[],
    @Args('limit', { nullable: true }) limit?: number,
    @Args('offset', { nullable: true }) offset?: number,
  ): Promise<Activity[]> {
    return this.activityService.getFeed(profileId, connectionIds, { limit, offset });
  }

  @Mutation(() => Activity)
  @UseGuards(GqlAuthGuard)
  async createActivity(
    @Args('input') input: CreateActivityInput,
  ): Promise<Activity> {
    return this.activityService.create(input);
  }

  @Mutation(() => Activity)
  @UseGuards(GqlAuthGuard)
  async updateActivity(
    @Args('id') id: string,
    @Args('input') input: UpdateActivityInput,
  ): Promise<Activity> {
    return this.activityService.update(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteActivity(@Args('id') id: string): Promise<boolean> {
    return this.activityService.delete(id);
  }

  @Mutation(() => Activity)
  @UseGuards(GqlAuthGuard)
  async likeActivity(@Args('id') id: string): Promise<Activity> {
    await this.activityService.incrementInteraction(id, 'likesCount');
    return this.activityService.findById(id);
  }

  @Mutation(() => Activity)
  @UseGuards(GqlAuthGuard)
  async unlikeActivity(@Args('id') id: string): Promise<Activity> {
    await this.activityService.decrementInteraction(id, 'likesCount');
    return this.activityService.findById(id);
  }

  @ResolveField(() => Profile)
  async profile(@Parent() activity: Activity): Promise<Profile> {
    return this.profileService.findOne(activity.profileId);
  }

  @ResolveField(() => Number)
  async likesCount(@Parent() activity: Activity): Promise<number> {
    return activity.likesCount;
  }

  @ResolveField(() => Number)
  async commentsCount(@Parent() activity: Activity): Promise<number> {
    return activity.commentsCount;
  }

  @ResolveField(() => Number)
  async sharesCount(@Parent() activity: Activity): Promise<number> {
    return activity.sharesCount;
  }
} 