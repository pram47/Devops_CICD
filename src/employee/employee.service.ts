import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AssignUserDto } from './dto/assign-user.dto';
import { SearchEmployeeDto } from './dto/search-employee.dto';

type UpstreamUser = {
  id: string;
  login_option?: number | null;
  first_name?: string | null;
  last_name?: string | null;
};

type UpstreamCompanyEmployee = {
  id: string;
  user_id?: string | null;
  company_id: string;
  email?: string | null;
  role: number;
};

type EmployeeListRow = UpstreamCompanyEmployee & {
  first_name?: string | null;
  last_name?: string | null;
};

@Injectable()
export class EmployeeService {
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

  private async deleteJson<T>(path: string): Promise<T> {
    const res = await fetch(`${this.postgresBaseUrl()}${path}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const resBody = await res.text().catch(() => '');
      throw new Error(`Upstream @jobby-db-postgres failed ${res.status} for ${path}: ${resBody}`);
    }

    if (res.status === 204) {
      return { success: true } as T;
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
      throw new ForbiddenException('Only root company user can manage employees');
    }
  }

  async assignUser(authUserId: string, dto: AssignUserDto) {
    await this.ensureRootCompanyUser(authUserId);

    return this.postJson(`/company/${encodeURIComponent(dto.company_id)}/employee`, {
      email: dto.email,
      role: dto.role ?? 2,
    });
  }

  async getEmployees(authUserId: string, query: SearchEmployeeDto) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 10;
    const membershipRows = await this.fetchJson<UpstreamCompanyEmployee[]>(
      `/company/employee/${encodeURIComponent(authUserId)}`,
    );
    const companyIds = [...new Set(membershipRows.map((row) => row.company_id).filter(Boolean))];
    if (companyIds.length === 0) {
      return {
        data: [],
        page,
        limit,
        total: 0,
      };
    }

    const employeeGroups = await Promise.all(
      companyIds.map((companyId) =>
        this.fetchJson<UpstreamCompanyEmployee[]>(
          `/company/${encodeURIComponent(companyId)}/employee`,
        ),
      ),
    );
    const rows = employeeGroups.flat();

    const uniqueRows = rows.filter(
      (row, index, arr) => arr.findIndex((candidate) => candidate.id === row.id) === index,
    );
    const search = (query.search ?? '').trim().toLowerCase();

    const filtered = uniqueRows.filter((row) => {
      const byRole = query.role_id === undefined || row.role === query.role_id;
      const bySearch =
        !search ||
        (row.email ?? '').toLowerCase().includes(search) ||
        (row.user_id ?? '').toLowerCase().includes(search) ||
        row.company_id.toLowerCase().includes(search);

      return byRole && bySearch;
    });

    const userIds = Array.from(
      new Set(filtered.map((row) => row.user_id?.trim()).filter((value): value is string => Boolean(value))),
    );
    const userEntries = await Promise.all(
      userIds.map(async (userId) => [
        userId,
        await this.fetchJson<UpstreamUser>(`/user/${encodeURIComponent(userId)}`).catch(() => null),
      ]),
    );
    const userMap = new Map<string, UpstreamUser | null>(userEntries as Array<[string, UpstreamUser | null]>);

    const enriched: EmployeeListRow[] = filtered.map((row) => {
      const user = row.user_id ? userMap.get(row.user_id) : null;
      return {
        ...row,
        first_name: user?.first_name ?? null,
        last_name: user?.last_name ?? null,
      };
    });

    const start = page * limit;
    const data = enriched.slice(start, start + limit);

    return {
      data,
      page,
      limit,
      total: enriched.length,
    };
  }

  async deleteEmployee(authUserId: string, userId: string) {
    await this.ensureRootCompanyUser(authUserId);
    return this.deleteJson<Record<string, unknown>>(
      `/company/employee/${encodeURIComponent(userId)}`,
    );
  }
}
