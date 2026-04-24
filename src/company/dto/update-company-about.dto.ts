import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UpdateCompanyAboutDto {
  @ApiProperty({ description: 'Company about text' })
  @IsString()
  about: string;
}
