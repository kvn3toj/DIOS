import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum, IsObject, IsUrl, IsBoolean } from 'class-validator';
import { NotificationPriority, NotificationStatus } from '../notification.entity';

@InputType()
export class UpdateNotificationInput {
  @Field(() => NotificationStatus, { nullable: true })
  @IsEnum(NotificationStatus)
  @IsOptional()
  status?: NotificationStatus;

  @Field(() => NotificationPriority, { nullable: true })
  @IsEnum(NotificationPriority)
  @IsOptional()
  priority?: NotificationPriority;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  title?: string;

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