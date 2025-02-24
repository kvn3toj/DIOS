import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsOptional, IsArray, IsUrl } from 'class-validator';

@InputType()
export class CreateProfileInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  bio?: string;

  @Field({ nullable: true })
  @IsString()
  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @Field(() => [String], { nullable: true })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  interests?: string[];

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  settings?: string;
} 