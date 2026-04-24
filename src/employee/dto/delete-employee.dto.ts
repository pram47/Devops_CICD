import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteEmployeeDto {
  @ApiProperty({ description: 'User id to remove from company employee access' })
  @IsString()
  user_id: string;
}
