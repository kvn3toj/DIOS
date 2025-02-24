import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsString, IsOptional, IsEnum, IsObject, IsUrl, IsBoolean } from 'class-validator';
import { NotificationType, NotificationPriority } from '../notification.entity';

@InputType()
export class CreateNotificationInput {
  @Field()
  @IsUUID()
  profileId: string;

  @Field(() => NotificationType)
  @IsEnum(NotificationType)
  type: NotificationType;

  @Field(() => NotificationPriority, { defaultValue: NotificationPriority.MEDIUM })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @Field()
  @IsString()
  title: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  message?: string;

  @Field(() => Object, { nullable: true })
  @IsObject()
  @IsOptional()
  data?: Record<string, any>;

  @Field({ nullable: true })
  @IsString()
  @IsUrl()
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  action?: string;

  @Field({ nullable: true })
  @IsString()
  @IsUrl()
  @IsOptional()
  actionUrl?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActionable?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isDismissible?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isSticky?: boolean;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  expiresAt?: Date;
} 