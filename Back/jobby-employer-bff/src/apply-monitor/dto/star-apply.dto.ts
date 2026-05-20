import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class StarApplyDto {
  @ApiProperty({
    description: 'Set apply as starred/unstarred',
    example: true,
  })
  @IsBoolean()
  is_star: boolean;
}
