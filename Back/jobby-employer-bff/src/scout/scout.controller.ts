import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SessionUserMatchGuard,
  UseAuthUserIdSources,
} from '../auth/guards/session-user-match.guard';
import { SearchScoutDto } from './dto/search-scout.dto';
import { StarScoutDto } from './dto/star-scout.dto';
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
  @ApiQuery({
    name: 'company_id',
    required: false,
    description: 'Company id for favorite-scouter context',
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search by user name or email' })
  @ApiQuery({ name: 'job_name', required: false, description: 'Filter company jobs by name' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated scout user list' })
  getScouts(@Req() req: RequestWithAuthUser, @Query() query: SearchScoutDto) {
    return this.scoutService.getScouts(req.auth_user_id ?? '', query);
  }

  @Patch('company/:companyId/user/:userId/star')
  @ApiOperation({ summary: 'Star/unstar scout user as company favorite' })
  @ApiParam({ name: 'companyId', description: 'Company id' })
  @ApiParam({ name: 'userId', description: 'Scout user id' })
  @ApiBody({ type: StarScoutDto })
  @ApiResponse({ status: 200, description: 'Updated scout favorite status' })
  starScout(
    @Req() req: RequestWithAuthUser,
    @Param('companyId') companyId: string,
    @Param('userId') userId: string,
    @Body() body: StarScoutDto,
  ) {
    return this.scoutService.starScout(req.auth_user_id ?? '', companyId, userId, body.is_star);
  }
}
