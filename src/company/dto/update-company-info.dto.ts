import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

class UpdateCompanyContactItemDto {
  @ApiPropertyOptional({ description: 'Display order; defaults to array index' })
  @IsOptional()
  @Type(() => Number)
  index?: number;

  @ApiPropertyOptional({ description: 'Contact label, e.g. Facebook' })
  @IsOptional()
  @IsString()
  label?: string;

  @ApiPropertyOptional({ description: 'Contact link, e.g. https://facebook.com/...' })
  @IsOptional()
  @IsString()
  link?: string;
}

export class UpdateCompanyInfoDto {
  @ApiPropertyOptional({ description: 'Company name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Company email' })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiPropertyOptional({ description: 'Company phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Phone region dialing code, e.g. +66' })
  @IsOptional()
  @IsString()
  phone_region?: string;

  @ApiPropertyOptional({ description: 'Address line' })
  @IsOptional()
  @IsString()
  address_line?: string;

  @ApiPropertyOptional({ description: 'House number' })
  @IsOptional()
  @IsString()
  no?: string;

  @ApiPropertyOptional({ description: 'Moo' })
  @IsOptional()
  @IsString()
  moo?: string;

  @ApiPropertyOptional({ description: 'Soi' })
  @IsOptional()
  @IsString()
  soi?: string;

  @ApiPropertyOptional({ description: 'Street' })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiPropertyOptional({ description: 'Sub district id', example: 100101 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sub_district_id?: number;

  @ApiPropertyOptional({ description: 'District id', example: 1001 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  district_id?: number;

  @ApiPropertyOptional({ description: 'Province id', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  province_id?: number;

  @ApiPropertyOptional({ description: 'Country id', example: 76400 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  country_id?: number;

  @ApiPropertyOptional({ description: 'Postal code row id', example: 10110 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  postal_code_id?: number;

  @ApiPropertyOptional({
    description:
      '5-digit postal code; upstream resolves to `postal_code_id`. Send `sub_district_id` if the code is ambiguous.',
    example: 10110,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  postal_code?: number;

  @ApiPropertyOptional({
    type: [UpdateCompanyContactItemDto],
    description:
      'When present, replaces all company_contact rows for this company. Omit to leave contacts unchanged.',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateCompanyContactItemDto)
  contacts?: UpdateCompanyContactItemDto[];
}
