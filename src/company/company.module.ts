import { Module } from '@nestjs/common';
import { SessionUserMatchGuard } from '../auth/guards/session-user-match.guard';
import { UtilityModule } from '../utility/utility.module';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  imports: [UtilityModule],
  controllers: [CompanyController],
  providers: [CompanyService, SessionUserMatchGuard],
})
export class CompanyModule {}
