import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AssignUserDto {
  @ApiProperty({ description: 'Company id to assign user into' })
  @IsString()
  company_id: string;

  @ApiProperty({ description: 'User email to add into company employee access' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description: 'Company role id (default 2)',
    example: 2,
    default: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  role?: number;
}
