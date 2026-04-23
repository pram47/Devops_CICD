import { Module } from '@nestjs/common';
import { SessionUserMatchGuard } from '../auth/guards/session-user-match.guard';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, SessionUserMatchGuard],
})
export class CompanyModule {}
