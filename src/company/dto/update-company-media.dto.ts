import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UpdateCompanyMediaDto {
  @ApiProperty({ description: 'Media field to update', enum: ['logo', 'banner'] })
  @IsString()
  @IsIn(['logo', 'banner'])
  field: 'logo' | 'banner';
}
