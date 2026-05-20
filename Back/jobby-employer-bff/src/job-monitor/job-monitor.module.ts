import { Module } from '@nestjs/common';
import { SessionUserMatchGuard } from '../auth/guards/session-user-match.guard';
import { JobMonitorController } from './job-monitor.controller';
import { JobMonitorService } from './job-monitor.service';

@Module({
  controllers: [JobMonitorController],
  providers: [JobMonitorService, SessionUserMatchGuard],
})
export class JobMonitorModule {}
