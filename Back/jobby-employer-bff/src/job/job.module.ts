import { Module } from '@nestjs/common';
import { SessionUserMatchGuard } from '../auth/guards/session-user-match.guard';
import { JobController } from './job.controller';
import { JobService } from './job.service';

@Module({
  controllers: [JobController],
  providers: [JobService, SessionUserMatchGuard],
})
export class JobModule {}
