import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  SessionUserMatchGuard,
  UseAuthUserIdSources,
} from '../auth/guards/session-user-match.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobService } from './job.service';

@ApiTags('job')
@ApiBearerAuth()
@UseGuards(SessionUserMatchGuard)
@UseAuthUserIdSources()
@Controller('job')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get job detail' })
  @ApiParam({ name: 'id', description: 'Job id (UUID)' })
  @ApiResponse({ status: 200, description: 'Job detail' })
  getDetail(@Param('id') id: string) {
    return this.jobService.getDetail(id);
  }

  @Post(':company_id')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create job in Postgres + Neo4j and persist neo eid back to Postgres' })
  @ApiParam({ name: 'company_id', description: 'Company id (UUID)' })
  @ApiResponse({ status: 201, description: 'Job created successfully with neo4j element id' })
  create(@Param('company_id') companyId: string, @Body() createJobDto: CreateJobDto) {
    return this.jobService.create(companyId, createJobDto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update job in Postgres + sync Neo4j and keep eid in Postgres' })
  @ApiParam({ name: 'id', description: 'Job id (UUID)' })
  @ApiResponse({
    status: 200,
    description: 'Job updated successfully with synced neo4j element id',
  })
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto) {
    return this.jobService.update(id, updateJobDto);
  }
}
