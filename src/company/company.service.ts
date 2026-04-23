import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssignUserDto } from './dto/assign-user.dto';

type UpstreamUser = {
  id: string;
  login_option?: number | null;
};

@Injectable()
export class CompanyService {
  constructor(private readonly config: ConfigService) {}

  private postgresBaseUrl(): string {
    const url = this.config.get<string>('JOBBY_DB_POSTGRES_URL');
    if (!url) {
      throw new Error('Missing env JOBBY_DB_POSTGRES_URL for jobby-employer-bff');
    }
    return url.replace(/\/+$/, '');
  }

  private async postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.postgresBaseUrl()}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const resBody = await res.text().catch(() => '');
      throw new Error(`Upstream @jobby-db-postgres failed ${res.status} for ${path}: ${resBody}`);
    }

    return (await res.json()) as T;
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const res = await fetch(`${this.postgresBaseUrl()}${path}`);
    if (!res.ok) {
      const resBody = await res.text().catch(() => '');
      throw new Error(`Upstream @jobby-db-postgres failed ${res.status} for ${path}: ${resBody}`);
    }
    return (await res.json()) as T;
  }

  private async ensureRootCompanyUser(authUserId: string): Promise<void> {
    const user = await this.fetchJson<UpstreamUser>(`/user/${encodeURIComponent(authUserId)}`);
    if (user?.login_option !== 2) {
      throw new ForbiddenException('Only root company user can assign users');
    }
  }

  async assignUser(authUserId: string, dto: AssignUserDto) {
    await this.ensureRootCompanyUser(authUserId);

    return this.postJson(`/company/${encodeURIComponent(dto.company_id)}/employee`, {
      email: dto.email,
      role: dto.role ?? 2,
    });
  }
}
