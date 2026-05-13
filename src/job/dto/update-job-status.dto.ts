import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class UpdateJobStatusDto {
  @ApiProperty({ description: 'Job status id', example: 1 })
  @IsInt()
  status: number;
}
