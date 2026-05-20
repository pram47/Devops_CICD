import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ApplyMonitorModule } from './apply-monitor/apply-monitor.module';
import { CompanyModule } from './company/company.module';
import { EmployeeModule } from './employee/employee.module';
import { HealthModule } from './health/health.module';
import { JobModule } from './job/job.module';
import { JobMonitorModule } from './job-monitor/job-monitor.module';
import { ScoutModule } from './scout/scout.module';
import { UtilityModule } from './utility/utility.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    ApplyMonitorModule,
    CompanyModule,
    EmployeeModule,
    HealthModule,
    JobModule,
    JobMonitorModule,
    ScoutModule,
    UtilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
