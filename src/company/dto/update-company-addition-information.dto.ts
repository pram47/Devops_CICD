import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCompanyAdditionInformationDto {
  @ApiProperty({ description: 'Company additional information text' })
  @IsString()
  addition_information: string;

  @ApiProperty({ description: 'Company additional information rich text', required: false })
  @IsOptional()
  @IsString()
  addition_information_rtf?: string;
}
