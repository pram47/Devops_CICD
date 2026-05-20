import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PostgresService } from '../database/postgres.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly postgres: PostgresService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async check() {
    let dbConnected = false;
    let dbError: string | null = null;

    if (this.postgres.isConfigured()) {
      try {
        dbConnected = await this.postgres.ping();
      } catch (error) {
        dbError = error instanceof Error ? error.message : 'unknown database error';
      }
    }

    return {
      status: dbConnected || !this.postgres.isConfigured() ? 'ok' : 'degraded',
      service: 'jobby-employer-bff',
      database: {
        mode: 'direct-postgres',
        configured: this.postgres.isConfigured(),
        connected: dbConnected,
        error: dbError,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
