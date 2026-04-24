import { Body, Controller, Get, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SessionUserMatchGuard,
  UseAuthUserIdSources,
} from '../auth/guards/session-user-match.guard';
import { SearchApplyMonitorDto } from './dto/search-apply-monitor.dto';
import { StarApplyDto } from './dto/star-apply.dto';
import { UpdateApplyStatusDto } from './dto/update-apply-status.dto';
import { UpdateApplyViewedDto } from './dto/update-apply-viewed.dto';
import { ApplyMonitorService } from './apply-monitor.service';

type RequestWithAuthUser = {
  auth_user_id?: string;
};

@ApiTags('apply-monitor')
@UseGuards(SessionUserMatchGuard)
@UseAuthUserIdSources()
@Controller('apply-monitor')
export class ApplyMonitorController {
  constructor(private readonly applyMonitorService: ApplyMonitorService) {}

  @Get('options')
  @ApiOperation({ summary: 'Get apply-monitor options (apply + job)' })
  @ApiResponse({ status: 200, description: 'Apply monitor options' })
  getOptions(@Req() req: RequestWithAuthUser) {
    return this.applyMonitorService.getOptions(req.auth_user_id ?? '');
  }

  @Get('options/job/skills')
  @ApiOperation({ summary: 'Search skill options for job section' })
  @ApiQuery({ name: 'searchName', required: false, description: 'Skill search text' })
  @ApiResponse({ status: 200, description: 'Skill options for job search' })
  getJobSkillOptions(@Req() req: RequestWithAuthUser, @Query('searchName') searchName = '') {
    return this.applyMonitorService.searchJobSkillOptions(req.auth_user_id ?? '', searchName);
  }

  @Get('search/apply')
  @ApiOperation({ summary: 'Search apply monitor - apply section' })
  @ApiQuery({ name: 'search', required: false, description: 'Search candidate name' })
  @ApiQuery({ name: 'applyStatusId', required: false, type: Number })
  @ApiQuery({ name: 'sortById', required: false, type: Number })
  @ApiQuery({
    name: 'skillIds',
    required: false,
    description: 'JSON array string of skill_id, e.g. ["skill-id-1","skill-id-2"]',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Apply section results' })
  searchApply(@Req() req: RequestWithAuthUser, @Query() query: SearchApplyMonitorDto) {
    return this.applyMonitorService.searchApply(req.auth_user_id ?? '', query);
  }

  @Get('apply/:id')
  @ApiOperation({ summary: 'Get apply detail by id' })
  @ApiParam({ name: 'id', description: 'Apply id' })
  @ApiResponse({ status: 200, description: 'Apply detail' })
  getApplyDetail(@Req() req: RequestWithAuthUser, @Param('id') id: string) {
    return this.applyMonitorService.getApplyDetail(req.auth_user_id ?? '', id);
  }

  @Get('job/:jobId/detail')
  @ApiOperation({ summary: 'Get job detail by job id' })
  @ApiParam({ name: 'jobId', description: 'Job id' })
  @ApiResponse({ status: 200, description: 'Job detail' })
  getJobDetail(@Req() req: RequestWithAuthUser, @Param('jobId') jobId: string) {
    return this.applyMonitorService.getJobDetail(req.auth_user_id ?? '', jobId);
  }

  @Get('job/:jobId/applies')
  @ApiOperation({ summary: 'Get apply list by job id' })
  @ApiParam({ name: 'jobId', description: 'Job id' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'applyStatusId', required: false, type: Number })
  @ApiQuery({ name: 'sortById', required: false, type: Number })
  @ApiQuery({ name: 'starredOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'userSkillMoreThan', required: false, type: Number })
  @ApiQuery({ name: 'experienceMoreThan', required: false, type: Number })
  @ApiQuery({ name: 'achievementMoreThan', required: false, type: Number })
  @ApiQuery({ name: 'projectMoreThan', required: false, type: Number })
  @ApiQuery({ name: 'yearExperienceMoreThan', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Apply list by job id' })
  getApplyByJobId(
    @Req() req: RequestWithAuthUser,
    @Param('jobId') jobId: string,
    @Query() query: SearchApplyMonitorDto,
  ) {
    return this.applyMonitorService.getApplyByJobId(req.auth_user_id ?? '', jobId, query);
  }

  @Patch('apply/:id/star')
  @ApiOperation({ summary: 'Star/unstar apply by id' })
  @ApiParam({ name: 'id', description: 'Apply id' })
  @ApiBody({ type: StarApplyDto })
  @ApiResponse({ status: 200, description: 'Updated apply star status' })
  starApply(@Req() req: RequestWithAuthUser, @Param('id') id: string, @Body() body: StarApplyDto) {
    return this.applyMonitorService.starApply(req.auth_user_id ?? '', id, body.is_star);
  }

  @Patch('apply/:id/status')
  @ApiOperation({ summary: 'Update apply status by id' })
  @ApiParam({ name: 'id', description: 'Apply id' })
  @ApiBody({ type: UpdateApplyStatusDto })
  @ApiResponse({ status: 200, description: 'Updated apply status' })
  updateApplyStatus(
    @Req() req: RequestWithAuthUser,
    @Param('id') id: string,
    @Body() body: UpdateApplyStatusDto,
  ) {
    return this.applyMonitorService.updateApplyStatus(req.auth_user_id ?? '', id, body.status);
  }

  @Patch('apply/:id/viewed')
  @ApiOperation({ summary: 'Update apply viewed flag by id' })
  @ApiParam({ name: 'id', description: 'Apply id' })
  @ApiBody({ type: UpdateApplyViewedDto })
  @ApiResponse({ status: 200, description: 'Updated apply viewed flag' })
  updateApplyViewed(
    @Req() req: RequestWithAuthUser,
    @Param('id') id: string,
    @Body() body: UpdateApplyViewedDto,
  ) {
    return this.applyMonitorService.updateApplyViewed(req.auth_user_id ?? '', id, body.is_viewed);
  }

  @Get('search/job')
  @ApiOperation({ summary: 'Search apply monitor - job section' })
  @ApiQuery({ name: 'sortById', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Job section results' })
  searchJob(@Req() req: RequestWithAuthUser, @Query() query: SearchApplyMonitorDto) {
    return this.applyMonitorService.searchJob(req.auth_user_id ?? '', query);
  }
}
