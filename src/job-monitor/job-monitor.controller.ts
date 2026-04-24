import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SessionUserMatchGuard,
  UseAuthUserIdSources,
} from '../auth/guards/session-user-match.guard';
import { SearchJobMonitorDto } from './dto/search-job-monitor.dto';
import { JobMonitorService } from './job-monitor.service';

type RequestWithAuthUser = {
  auth_user_id?: string;
};

@ApiTags('job-monitor')
@UseGuards(SessionUserMatchGuard)
@UseAuthUserIdSources()
@Controller('job-monitor')
export class JobMonitorController {
  constructor(private readonly jobMonitorService: JobMonitorService) {}

  @Get('job')
  @ApiOperation({ summary: 'List jobs in company with filters and pagination' })
  @ApiQuery({ name: 'search', required: false, description: 'Search job name' })
  @ApiQuery({ name: 'job_status_id', required: false, type: Number })
  @ApiQuery({ name: 'sort_by_id', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated company jobs' })
  getJobs(@Req() req: RequestWithAuthUser, @Query() query: SearchJobMonitorDto) {
    return this.jobMonitorService.getJobs(req.auth_user_id ?? '', query);
  }
}
