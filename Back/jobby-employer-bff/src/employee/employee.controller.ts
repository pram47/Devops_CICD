import { Body, Controller, Delete, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SessionUserMatchGuard,
  UseAuthUserIdSources,
} from '../auth/guards/session-user-match.guard';
import { AssignUserDto } from './dto/assign-user.dto';
import { DeleteEmployeeDto } from './dto/delete-employee.dto';
import { SearchEmployeeDto } from './dto/search-employee.dto';
import { EmployeeService } from './employee.service';

type RequestWithAuthUser = {
  auth_user_id?: string;
};

@ApiTags('employee')
@UseGuards(SessionUserMatchGuard)
@UseAuthUserIdSources()
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('assign-user')
  @ApiOperation({ summary: 'Assign user into company employee access list' })
  @ApiBody({ type: AssignUserDto })
  assignUser(@Req() req: RequestWithAuthUser, @Body() dto: AssignUserDto) {
    return this.employeeService.assignUser(req.auth_user_id ?? '', dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get employees by query filters' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by email or user id' })
  @ApiQuery({ name: 'role_id', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Employee list' })
  getEmployees(@Req() req: RequestWithAuthUser, @Query() query: SearchEmployeeDto) {
    return this.employeeService.getEmployees(req.auth_user_id ?? '', query);
  }

  @Delete()
  @ApiOperation({ summary: 'Delete employee by user id' })
  @ApiQuery({ name: 'user_id', required: true, type: String })
  @ApiResponse({ status: 200, description: 'Deleted employee access' })
  deleteEmployee(@Req() req: RequestWithAuthUser, @Query() query: DeleteEmployeeDto) {
    return this.employeeService.deleteEmployee(req.auth_user_id ?? '', query.user_id);
  }
}
