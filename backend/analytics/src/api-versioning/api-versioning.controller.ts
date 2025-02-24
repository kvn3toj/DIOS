import { Controller, Post, Put, Get, Body, Param, ValidationPipe } from '@nestjs/common';
import { ApiVersioningService } from './api-versioning.service';
import { ApiVersion } from './entities/api-version.entity';

class CreateVersionDto {
  version: string;
  path: string;
  supportedFeatures: string[];
  compatibility: {
    minClientVersion: string;
    maxClientVersion: string;
    breakingChanges: {
      description: string;
      affectedEndpoints: string[];
      migrationGuide: string;
    }[];
  };
}

class DeprecationPolicyDto {
  announcementDate: Date;
  deprecationDate: Date;
  sunsetDate: Date;
  migrationPath: string;
}

class BreakingChangeDto {
  description: string;
  affectedEndpoints: string[];
  migrationGuide: string;
}

class UpdateMetricsDto {
  activeClients?: number;
  requestCount?: number;
  errorRate?: number;
}

class UpdateDocumentationDto {
  changelog?: string;
  migrationGuides?: string[];
  compatibilityNotes?: string;
}

@Controller('api-versions')
export class ApiVersioningController {
  constructor(private readonly versioningService: ApiVersioningService) {}

  @Post()
  async createVersion(
    @Body(ValidationPipe) createVersionDto: CreateVersionDto
  ): Promise<ApiVersion> {
    return this.versioningService.createVersion(
      createVersionDto.version,
      createVersionDto.path,
      createVersionDto.supportedFeatures,
      createVersionDto.compatibility
    );
  }

  @Put(':version/deprecate')
  async deprecateVersion(
    @Param('version') version: string,
    @Body(ValidationPipe) deprecationPolicyDto: DeprecationPolicyDto
  ): Promise<ApiVersion> {
    return this.versioningService.deprecateVersion(version, deprecationPolicyDto);
  }

  @Put(':version/sunset')
  async sunsetVersion(
    @Param('version') version: string
  ): Promise<ApiVersion> {
    return this.versioningService.sunsetVersion(version);
  }

  @Put(':version/metrics')
  async updateMetrics(
    @Param('version') version: string,
    @Body(ValidationPipe) metricsDto: UpdateMetricsDto
  ): Promise<ApiVersion> {
    return this.versioningService.updateMetrics(version, metricsDto);
  }

  @Post(':version/breaking-changes')
  async addBreakingChange(
    @Param('version') version: string,
    @Body(ValidationPipe) breakingChangeDto: BreakingChangeDto
  ): Promise<ApiVersion> {
    return this.versioningService.addBreakingChange(version, breakingChangeDto);
  }

  @Put(':version/documentation')
  async updateDocumentation(
    @Param('version') version: string,
    @Body(ValidationPipe) documentationDto: UpdateDocumentationDto
  ): Promise<ApiVersion> {
    return this.versioningService.updateDocumentation(version, documentationDto);
  }

  @Get()
  async getActiveVersions(): Promise<ApiVersion[]> {
    return this.versioningService.getActiveVersions();
  }

  @Get('validate/:clientVersion')
  async validateClientVersion(
    @Param('clientVersion') clientVersion: string
  ): Promise<{
    compatible: boolean;
    recommendedVersion?: string;
    migrationGuide?: string;
  }> {
    return this.versioningService.validateClientVersion(clientVersion);
  }
} 