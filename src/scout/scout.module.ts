import { Module } from '@nestjs/common';
import { SessionUserMatchGuard } from '../auth/guards/session-user-match.guard';
import { ScoutController } from './scout.controller';
import { ScoutService } from './scout.service';

@Module({
  controllers: [ScoutController],
  providers: [ScoutService, SessionUserMatchGuard],
})
export class ScoutModule {}
