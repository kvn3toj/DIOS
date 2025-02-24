import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { ConnectionStatus } from '../connection.entity';

@InputType()
export class UpdateConnectionInput {
  @Field(() => ConnectionStatus, { nullable: true })
  @IsEnum(ConnectionStatus)
  @IsOptional()
  status?: ConnectionStatus;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  note?: string;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isFavorite?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  notificationsEnabled?: boolean;
} 