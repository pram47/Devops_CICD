import { Body, Controller, Get, Headers, Param, Patch, Query } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchApplyMonitorDto } from './dto/search-apply-monitor.dto';
import { StarApplyDto } from './dto/star-apply.dto';
import { ApplyMonitorService } from './apply-monitor.service';

@ApiTags('apply-monitor')
@Controller('apply-monitor')
export class ApplyMonitorController {
  constructor(private readonly applyMonitorService: ApplyMonitorService) {}

  @Get('options/apply')
  @ApiOperation({ summary: 'Get search options for apply section' })
  @ApiResponse({ status: 200, description: 'Apply search options' })
  getApplyOptions(@Headers('authorization') authorization?: string) {
    return this.applyMonitorService.getApplySearchOptions(authorization);
  }

  @Get('options/apply/statuses')
  @ApiOperation({ summary: 'Get apply status list for dropdown' })
  @ApiResponse({ status: 200, description: 'Apply status list' })
  getApplyStatusList(@Headers('authorization') authorization?: string) {
    return this.applyMonitorService.getApplyStatusList(authorization);
  }

  @Get('options/job')
  @ApiOperation({ summary: 'Get search options for job section' })
  @ApiResponse({ status: 200, description: 'Job search options' })
  getJobOptions(@Headers('authorization') authorization?: string) {
    return this.applyMonitorService.getJobSearchOptions(authorization);
  }

  @Get('options/job/skills')
  @ApiOperation({ summary: 'Search skill options for job section' })
  @ApiQuery({ name: 'searchName', required: false, description: 'Skill search text' })
  @ApiResponse({ status: 200, description: 'Skill options for job search' })
  getJobSkillOptions(
    @Query('searchName') searchName = '',
    @Headers('authorization') authorization?: string,
  ) {
    return this.applyMonitorService.searchJobSkillOptions(searchName, authorization);
  }

  @Get('search/apply')
  @ApiOperation({ summary: 'Search apply monitor - apply section' })
  @ApiQuery({ name: 'applyName', required: false })
  @ApiQuery({ name: 'applyStatus', required: false })
  @ApiQuery({ name: 'jobName', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Apply section results' })
  searchApply(
    @Query() query: SearchApplyMonitorDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.applyMonitorService.searchApply(query, authorization);
  }

  @Get('apply/:id')
  @ApiOperation({ summary: 'Get apply detail by id' })
  @ApiParam({ name: 'id', description: 'Apply id' })
  @ApiResponse({ status: 200, description: 'Apply detail' })
  getApplyDetail(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    return this.applyMonitorService.getApplyDetail(id, authorization);
  }

  @Get('job/:jobId/detail')
  @ApiOperation({ summary: 'Get job detail by job id' })
  @ApiParam({ name: 'jobId', description: 'Job id' })
  @ApiResponse({ status: 200, description: 'Job detail' })
  getJobDetail(@Param('jobId') jobId: string, @Headers('authorization') authorization?: string) {
    return this.applyMonitorService.getJobDetail(jobId, authorization);
  }

  @Get('job/:jobId/applies')
  @ApiOperation({ summary: 'Get apply list by job id' })
  @ApiParam({ name: 'jobId', description: 'Job id' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'applyName', required: false })
  @ApiQuery({ name: 'applyStatus', required: false })
  @ApiQuery({ name: 'applyStatusId', required: false, type: Number })
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
    @Param('jobId') jobId: string,
    @Query() query: SearchApplyMonitorDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.applyMonitorService.getApplyByJobId(jobId, query, authorization);
  }

  @Get('job/:jobId/applies/new')
  @ApiOperation({ summary: 'Get new applied list by job id' })
  @ApiParam({ name: 'jobId', description: 'Job id' })
  @ApiQuery({ name: 'applyName', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'New applied list by job id' })
  getNewAppliedByJobId(
    @Param('jobId') jobId: string,
    @Query() query: SearchApplyMonitorDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.applyMonitorService.getNewAppliedByJobId(jobId, query, authorization);
  }

  @Get('job/:jobId/applies/applied')
  @ApiOperation({ summary: 'Get applied list by job id' })
  @ApiParam({ name: 'jobId', description: 'Job id' })
  @ApiQuery({ name: 'applyName', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Applied list by job id' })
  getAppliedByJobId(
    @Param('jobId') jobId: string,
    @Query() query: SearchApplyMonitorDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.applyMonitorService.getAppliedByJobId(jobId, query, authorization);
  }

  @Get('job/:jobId/applies/interview')
  @ApiOperation({ summary: 'Get interview list by job id' })
  @ApiParam({ name: 'jobId', description: 'Job id' })
  @ApiQuery({ name: 'applyName', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Interview list by job id' })
  getInterviewByJobId(
    @Param('jobId') jobId: string,
    @Query() query: SearchApplyMonitorDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.applyMonitorService.getInterviewByJobId(jobId, query, authorization);
  }

  @Get('job/:jobId/applies/accept')
  @ApiOperation({ summary: 'Get accept list by job id' })
  @ApiParam({ name: 'jobId', description: 'Job id' })
  @ApiQuery({ name: 'applyName', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Accept list by job id' })
  getAcceptByJobId(
    @Param('jobId') jobId: string,
    @Query() query: SearchApplyMonitorDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.applyMonitorService.getAcceptByJobId(jobId, query, authorization);
  }

  @Get('job/:jobId/applies/reject')
  @ApiOperation({ summary: 'Get reject list by job id' })
  @ApiParam({ name: 'jobId', description: 'Job id' })
  @ApiQuery({ name: 'applyName', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Reject list by job id' })
  getRejectByJobId(
    @Param('jobId') jobId: string,
    @Query() query: SearchApplyMonitorDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.applyMonitorService.getRejectByJobId(jobId, query, authorization);
  }

  @Patch('apply/:id/star')
  @ApiOperation({ summary: 'Star/unstar apply by id' })
  @ApiParam({ name: 'id', description: 'Apply id' })
  @ApiBody({ type: StarApplyDto })
  @ApiResponse({ status: 200, description: 'Updated apply star status' })
  starApply(
    @Param('id') id: string,
    @Body() body: StarApplyDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.applyMonitorService.starApply(id, body.is_star, authorization);
  }

  @Get('search/job')
  @ApiOperation({ summary: 'Search apply monitor - job section' })
  @ApiQuery({ name: 'jobName', required: false })
  @ApiQuery({ name: 'jobStatus', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Job section results' })
  searchJob(
    @Query() query: SearchApplyMonitorDto,
    @Headers('authorization') authorization?: string,
  ) {
    return this.applyMonitorService.searchJob(query, authorization);
  }
}
