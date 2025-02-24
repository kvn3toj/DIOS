import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApiVersioningController } from './api-versioning.controller';
import { ApiVersioningService } from './api-versioning.service';
import { ApiVersion } from './entities/api-version.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApiVersion])
  ],
  controllers: [ApiVersioningController],
  providers: [ApiVersioningService],
  exports: [ApiVersioningService]
})
export class ApiVersioningModule {} 