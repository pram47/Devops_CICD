import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, type QueryResultRow } from 'pg';

@Injectable()
export class PostgresService implements OnModuleDestroy {
  private pool: Pool | null = null;

  constructor(private readonly config: ConfigService) {}

  private resolveConnectionString(): string | null {
    const databaseUrl = this.config.get<string>('DATABASE_URL')?.trim();
    if (databaseUrl) {
      return databaseUrl;
    }

    const legacyUrl = this.config.get<string>('JOBBY_DB_POSTGRES_URL')?.trim();
    if (legacyUrl?.startsWith('postgres://') || legacyUrl?.startsWith('postgresql://')) {
      return legacyUrl;
    }

    return null;
  }

  isConfigured(): boolean {
    return Boolean(this.resolveConnectionString());
  }

  private getPool(): Pool {
    if (this.pool) {
      return this.pool;
    }

    const connectionString = this.resolveConnectionString();
    if (!connectionString) {
      throw new Error(
        'Missing DATABASE_URL (or JOBBY_DB_POSTGRES_URL with postgres://) for direct Postgres mode',
      );
    }

    const sslEnabled = this.config.get<string>('DATABASE_SSL')?.toLowerCase() === 'true';
    this.pool = new Pool({
      connectionString,
      ssl: sslEnabled ? { rejectUnauthorized: false } : undefined,
    });

    return this.pool;
  }

  async ping(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }
    const result = await this.query<{ ok: number }>('select 1 as ok');
    return (result.rowCount ?? 0) > 0;
  }

  async query<T extends QueryResultRow>(text: string, params: unknown[] = []) {
    return this.getPool().query<T>(text, params);
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}