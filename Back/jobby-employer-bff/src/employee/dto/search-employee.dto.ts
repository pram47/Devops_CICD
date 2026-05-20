import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { EMPLOYEE_ROLE_IDS } from '../employee-role.constants';

export class SearchEmployeeDto {
  @ApiPropertyOptional({ description: 'Search employee by email or user id' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by role id (1=jobby_user, 2=employer_admin, 3=manager, 4=hr, 5=staff)',
    example: 2,
    enum: EMPLOYEE_ROLE_IDS,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsIn(EMPLOYEE_ROLE_IDS)
  role_id?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  page?: number = 0;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
