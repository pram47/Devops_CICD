import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SessionUserMatchGuard,
  UseAuthUserIdSources,
} from '../auth/guards/session-user-match.guard';
import { SearchScoutDto } from './dto/search-scout.dto';
import { ScoutService } from './scout.service';

type RequestWithAuthUser = {
  auth_user_id?: string;
};

@ApiTags('scout')
@UseGuards(SessionUserMatchGuard)
@UseAuthUserIdSources()
@Controller('scout')
export class ScoutController {
  constructor(private readonly scoutService: ScoutService) {}

  @Get()
  @ApiOperation({
    summary: 'Get scout user list ordered by skill match with company jobs',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search by user name or email' })
  @ApiQuery({ name: 'job_name', required: false, description: 'Filter company jobs by name' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated scout user list' })
  getScouts(@Req() req: RequestWithAuthUser, @Query() query: SearchScoutDto) {
    return this.scoutService.getScouts(req.auth_user_id ?? '', query);
  }
}
