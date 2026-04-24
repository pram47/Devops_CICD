import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateApplyStatusDto {
  @ApiProperty({
    description: 'Apply status id',
    example: 3,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  status: number;
}
