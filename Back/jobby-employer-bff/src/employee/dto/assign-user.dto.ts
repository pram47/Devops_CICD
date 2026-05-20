import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsOptional, IsString } from 'class-validator';
import { EMPLOYEE_ROLE_IDS } from '../employee-role.constants';

export class AssignUserDto {
  @ApiProperty({ description: 'Company id to assign user into' })
  @IsString()
  company_id: string;

  @ApiProperty({ description: 'User email to add into company employee access' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({
    description:
      'Company role id (1=jobby_user, 2=employer_admin, 3=manager, 4=hr, 5=staff; default 2)',
    example: 2,
    default: 2,
    enum: EMPLOYEE_ROLE_IDS,
  })
  @IsOptional()
  @IsInt()
  @IsIn(EMPLOYEE_ROLE_IDS)
  @Type(() => Number)
  role?: number;
}
