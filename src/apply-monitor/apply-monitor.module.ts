import { Module } from '@nestjs/common';
import { ApplyMonitorController } from './apply-monitor.controller';
import { ApplyMonitorService } from './apply-monitor.service';

@Module({
  controllers: [ApplyMonitorController],
  providers: [ApplyMonitorService],
})
export class ApplyMonitorModule {}
