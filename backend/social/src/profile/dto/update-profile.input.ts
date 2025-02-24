import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateProfileInput } from './create-profile.input';
import { IsOptional, IsBoolean } from 'class-validator';

@InputType()
export class UpdateProfileInput extends PartialType(CreateProfileInput) {
  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Field({ nullable: true })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
} 