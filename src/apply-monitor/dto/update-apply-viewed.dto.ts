import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateApplyViewedDto {
  @ApiProperty({
    description: 'Set apply as viewed/unviewed',
    example: true,
  })
  @IsBoolean()
  is_viewed: boolean;
}
