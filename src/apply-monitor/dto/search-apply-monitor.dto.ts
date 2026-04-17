import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchApplyMonitorDto {
  @ApiPropertyOptional({ description: 'Search apply by candidate name' })
  @IsOptional()
  @IsString()
  applyName?: string;

  @ApiPropertyOptional({ description: 'Filter by apply status' })
  @IsOptional()
  @IsString()
  applyStatus?: string;

  @ApiPropertyOptional({ description: 'Filter by apply status id', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  applyStatusId?: number;

  @ApiPropertyOptional({ description: 'Search text (candidate name)', example: 'chotanansub' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by job status' })
  @IsOptional()
  @IsString()
  jobStatus?: string;

  @ApiPropertyOptional({ description: 'Filter by work type' })
  @IsOptional()
  @IsString()
  workType?: string;

  @ApiPropertyOptional({ description: 'Search job by job name' })
  @IsOptional()
  @IsString()
  jobName?: string;

  @ApiPropertyOptional({ description: 'Filter by skill' })
  @IsOptional()
  @IsString()
  skill?: string;

  @ApiPropertyOptional({ description: 'User skill match more than this value', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  userSkillMoreThan?: number;

  @ApiPropertyOptional({ description: 'Experience match more than this value', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  experienceMoreThan?: number;

  @ApiPropertyOptional({ description: 'Achievement match more than this value', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  achievementMoreThan?: number;

  @ApiPropertyOptional({ description: 'Project match more than this value', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  projectMoreThan?: number;

  @ApiPropertyOptional({ description: 'Year experience more than this value', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  yearExperienceMoreThan?: number;

  @ApiPropertyOptional({ description: 'Show only starred applies', example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  starredOnly?: boolean;

  @ApiPropertyOptional({ description: 'Sort key' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;

  @ApiPropertyOptional({ default: 6 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 6;
}
