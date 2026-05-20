import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchJobMonitorDto } from './dto/search-job-monitor.dto';

type UpstreamCompanyEmployee = {
  company_id: string;
};

type UpstreamJobSummary = {
  id: string;
  company_id?: string | null;
  name: string | null;
  status: number;
  created_at?: string | null;
  start_apply?: string | null;
  end_apply?: string | null;
};

type UpstreamApplySummary = {
  job_id: string;
  company_id?: string | null;
};

type UpstreamReferenceStatus = {
  id: number;
  text_th: string | null;
  text_eng: string | null;
};

const SORT_BY = {
  NEWEST: 1,
  OLDEST: 2,
  MOST_APPLIED: 4,
} as const;

@Injectable()
export class JobMonitorService {
  constructor(private readonly config: ConfigService) {}

  private postgresBaseUrl(): string {
    const url = this.config.get<string>('JOBBY_DB_POSTGRES_URL');
    if (!url) {
      throw new Error('Missing env JOBBY_DB_POSTGRES_URL for jobby-employer-bff');
    }
    return url.replace(/\/+$/, '');
  }

  private async fetchJson<T>(path: string): Promise<T> {
    const res = await fetch(`${this.postgresBaseUrl()}${path}`);
    if (!res.ok) {
      const resBody = await res.text().catch(() => '');
      throw new Error(`Upstream @jobby-db-postgres failed ${res.status} for ${path}: ${resBody}`);
    }
    return (await res.json()) as T;
  }

  private parseDateMs(value: string | null | undefined): number {
    if (!value) return 0;
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }

  async getJobs(authUserId: string, query: SearchJobMonitorDto) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 10;
    const searchText = (query.search ?? '').trim().toLowerCase();

    const [employeeRows, jobs, applies, jobStatuses] = await Promise.all([
      this.fetchJson<UpstreamCompanyEmployee[]>(
        `/company/employee/${encodeURIComponent(authUserId)}`,
      ),
      this.fetchJson<UpstreamJobSummary[]>('/job'),
      this.fetchJson<UpstreamApplySummary[]>('/apply'),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/job-status'),
    ]);

    const companyIds = new Set(
      employeeRows
        .map((row) => row.company_id)
        .filter(
          (companyId): companyId is string => typeof companyId === 'string' && companyId.length > 0,
        ),
    );

    const scopedJobs = jobs.filter(
      (job) => typeof job.company_id === 'string' && companyIds.has(job.company_id),
    );
    const scopedApplies = applies.filter(
      (apply) => typeof apply.company_id === 'string' && companyIds.has(apply.company_id),
    );

    const filtered = scopedJobs.filter((job) => {
      const bySearch = !searchText || (job.name ?? '').toLowerCase().includes(searchText);
      const byStatus = query.job_status_id === undefined || job.status === query.job_status_id;
      return bySearch && byStatus;
    });

    const rows = filtered.map((job) => {
      const appliedCount = scopedApplies.filter((apply) => apply.job_id === job.id).length;
      const statusName = jobStatuses.find((item) => item.id === job.status);
      return {
        id: job.id,
        company_id: job.company_id ?? null,
        name: job.name ?? '',
        status: job.status,
        status_name: {
          th: statusName?.text_th ?? 'ไม่ทราบสถานะ',
          en: statusName?.text_eng ?? 'Unknown',
        },
        created_at: job.created_at ?? null,
        start_apply: job.start_apply ?? null,
        end_apply: job.end_apply ?? null,
        applied_count: appliedCount,
      };
    });

    const sortById = query.sort_by_id ?? SORT_BY.NEWEST;
    if (sortById === SORT_BY.OLDEST) {
      rows.sort((a, b) => this.parseDateMs(a.created_at) - this.parseDateMs(b.created_at));
    } else if (sortById === SORT_BY.MOST_APPLIED) {
      rows.sort((a, b) => b.applied_count - a.applied_count);
    } else {
      rows.sort((a, b) => this.parseDateMs(b.created_at) - this.parseDateMs(a.created_at));
    }

    const start = page * limit;
    const data = rows.slice(start, start + limit);

    return {
      data,
      page,
      limit,
      total: rows.length,
    };
  }
}
