import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class StarScoutDto {
  @ApiProperty({
    description: 'Set scout user as favorite/unfavorite',
    example: true,
  })
  @IsBoolean()
  is_star: boolean;
}
