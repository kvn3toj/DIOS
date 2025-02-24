import { Resolver, Query, Mutation, Args, ResolveField, Parent } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Notification, NotificationType, NotificationStatus, NotificationPriority } from './notification.entity';
import { NotificationService } from './notification.service';
import { CreateNotificationInput } from './dto/create-notification.input';
import { UpdateNotificationInput } from './dto/update-notification.input';
import { GqlAuthGuard } from '../auth/gql-auth.guard';
import { Profile } from '../profile/profile.entity';
import { ProfileService } from '../profile/profile.service';

@Resolver(() => Notification)
export class NotificationResolver {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly profileService: ProfileService,
  ) {}

  @Query(() => [Notification])
  @UseGuards(GqlAuthGuard)
  async notifications(
    @Args('profileId') profileId: string,
    @Args('type', { nullable: true }) type?: NotificationType,
    @Args('status', { nullable: true }) status?: NotificationStatus,
    @Args('priority', { nullable: true }) priority?: NotificationPriority,
    @Args('limit', { nullable: true }) limit?: number,
    @Args('offset', { nullable: true }) offset?: number,
  ): Promise<Notification[]> {
    return this.notificationService.findByProfileId(profileId, { type, status, priority, limit, offset });
  }

  @Query(() => [Notification])
  @UseGuards(GqlAuthGuard)
  async unreadNotifications(
    @Args('profileId') profileId: string,
    @Args('type', { nullable: true }) type?: NotificationType,
    @Args('priority', { nullable: true }) priority?: NotificationPriority,
    @Args('limit', { nullable: true }) limit?: number,
    @Args('offset', { nullable: true }) offset?: number,
  ): Promise<Notification[]> {
    return this.notificationService.findUnreadByProfileId(profileId, { type, priority, limit, offset });
  }

  @Query(() => Notification)
  @UseGuards(GqlAuthGuard)
  async notification(@Args('id') id: string): Promise<Notification> {
    return this.notificationService.findById(id);
  }

  @Query(() => Number)
  @UseGuards(GqlAuthGuard)
  async unreadNotificationCount(
    @Args('profileId') profileId: string,
    @Args('type', { nullable: true }) type?: NotificationType,
    @Args('priority', { nullable: true }) priority?: NotificationPriority,
  ): Promise<number> {
    return this.notificationService.countUnreadByProfileId(profileId, { type, priority });
  }

  @Mutation(() => Notification)
  @UseGuards(GqlAuthGuard)
  async createNotification(
    @Args('input') input: CreateNotificationInput,
  ): Promise<Notification> {
    return this.notificationService.create(input);
  }

  @Mutation(() => Notification)
  @UseGuards(GqlAuthGuard)
  async updateNotification(
    @Args('id') id: string,
    @Args('input') input: UpdateNotificationInput,
  ): Promise<Notification> {
    return this.notificationService.update(id, input);
  }

  @Mutation(() => Notification)
  @UseGuards(GqlAuthGuard)
  async markNotificationAsRead(@Args('id') id: string): Promise<Notification> {
    return this.notificationService.markAsRead(id);
  }

  @Mutation(() => Notification)
  @UseGuards(GqlAuthGuard)
  async markNotificationAsArchived(@Args('id') id: string): Promise<Notification> {
    return this.notificationService.markAsArchived(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteNotification(@Args('id') id: string): Promise<boolean> {
    return this.notificationService.delete(id);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async markAllNotificationsAsRead(
    @Args('profileId') profileId: string,
    @Args('type', { nullable: true }) type?: NotificationType,
  ): Promise<boolean> {
    await this.notificationService.markAllAsRead(profileId, type);
    return true;
  }

  @ResolveField(() => Profile)
  async profile(@Parent() notification: Notification): Promise<Profile> {
    return this.profileService.findOne(notification.profileId);
  }

  @ResolveField(() => Boolean)
  async isExpired(@Parent() notification: Notification): Promise<boolean> {
    if (!notification.expiresAt) {
      return false;
    }
    return new Date() > notification.expiresAt;
  }
} 