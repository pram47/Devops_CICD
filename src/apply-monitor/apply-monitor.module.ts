import { Module } from '@nestjs/common';
import { SessionUserMatchGuard } from '../auth/guards/session-user-match.guard';
import { ApplyMonitorController } from './apply-monitor.controller';
import { ApplyMonitorService } from './apply-monitor.service';

@Module({
  controllers: [ApplyMonitorController],
  providers: [ApplyMonitorService, SessionUserMatchGuard],
})
export class ApplyMonitorModule {}
