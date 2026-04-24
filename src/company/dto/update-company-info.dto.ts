import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

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
}
