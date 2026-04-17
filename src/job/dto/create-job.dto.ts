import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    description: 'Job title',
    example: 'Senior Backend Engineer',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({
    description: 'Job description',
    example: 'Build and maintain backend APIs for employer products.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Job location',
    example: 'Bangkok, Thailand',
  })
  @IsOptional()
  @IsString()
  location?: string;
}
