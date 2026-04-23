import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  SessionUserMatchGuard,
  UseAuthUserIdSources,
} from '../auth/guards/session-user-match.guard';
import { AssignUserDto } from './dto/assign-user.dto';
import { CompanyService } from './company.service';

type RequestWithAuthUser = {
  auth_user_id?: string;
};

@ApiTags('company')
@UseGuards(SessionUserMatchGuard)
@UseAuthUserIdSources()
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('assign-user')
  @ApiOperation({ summary: 'Assign user into company employee access list' })
  @ApiBody({ type: AssignUserDto })
  assignUser(@Req() req: RequestWithAuthUser, @Body() dto: AssignUserDto) {
    return this.companyService.assignUser(req.auth_user_id ?? '', dto);
  }
}
