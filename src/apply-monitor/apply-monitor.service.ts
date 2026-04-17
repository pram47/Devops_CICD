import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchApplyMonitorDto } from './dto/search-apply-monitor.dto';

type UpstreamApplySummary = {
  id: string;
  status: number;
  created_at: string | null;
};

type UpstreamApplyDetail = {
  id: string;
  status: number;
  created_at: string | null;
  job_id: string;
  resume_id?: string | null;
  match_skill: number | null;
  is_viewed: boolean;
  is_star: boolean;
  user?: {
    first_name?: string | null;
    last_name?: string | null;
  } | null;
  job?: {
    id?: string | null;
    name?: string | null;
    status?: number | null;
    start_apply?: string | null;
    end_apply?: string | null;
  } | null;
  resume?: {
    id?: string | null;
    name?: string | null;
    create_date?: string | null;
    theme?: number | null;
    color?: number | null;
    user_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
    phone_region?: string | null;
  } | null;
};

type UpstreamResumeWorkExperience = {
  start_date?: string | null;
  end_date?: string | null;
};

type UpstreamResumeDetail = Record<string, unknown> & {
  skills?: unknown[];
  work_experiences?: UpstreamResumeWorkExperience[];
  achievements?: unknown[];
  projects?: unknown[];
};

type UpstreamJobSummary = {
  id: string;
  name: string | null;
  status: number;
  start_apply: string | null;
  end_apply: string | null;
};

type UpstreamJobDetail = Record<string, unknown> & {
  id?: string;
  name?: string | null;
  status?: number;
};

type UpstreamReferenceStatus = {
  id: number;
  text_th: string | null;
  text_eng: string | null;
};

type UpstreamNeo4jSkillSearchItem = {
  eid: string;
  name?: string;
};

type StatusName = {
  th: string;
  en: string;
};

type ApplyWithResumeRow = {
  apply: UpstreamApplyDetail;
  resumeDetail: UpstreamResumeDetail | null;
};

const APPLY_STATUS_ID = {
  APPLIED: 1,
  APPLY: 2,
  INTERVIEW: 3,
  REJECT: 4,
  ACCEPT: 5,
} as const;

@Injectable()
export class ApplyMonitorService {
  constructor(private readonly config: ConfigService) {}

  private postgresBaseUrl(): string {
    const url = this.config.get<string>('JOBBY_DB_POSTGRES_URL');
    if (!url) {
      throw new Error('Missing env JOBBY_DB_POSTGRES_URL for jobby-employer-bff');
    }
    return url.replace(/\/+$/, '');
  }

  private neo4jBaseUrl(): string {
    const url =
      this.config.get<string>('JOBBY_DB_NEO4J_URL') ??
      this.config.get<string>('JOBBY_DB_Neo4J_URL');
    if (!url) {
      throw new Error('Missing env JOBBY_DB_NEO4J_URL for jobby-employer-bff');
    }
    return url.replace(/\/+$/, '');
  }

  private async fetchJson<T>(path: string, authorization?: string): Promise<T> {
    return this.fetchJsonFromBase<T>(
      this.postgresBaseUrl(),
      '@jobby-db-postgres',
      path,
      authorization,
    );
  }

  private async patchJson<T>(
    path: string,
    body: Record<string, unknown>,
    authorization?: string,
  ): Promise<T> {
    return this.patchJsonFromBase<T>(
      this.postgresBaseUrl(),
      '@jobby-db-postgres',
      path,
      body,
      authorization,
    );
  }

  private async fetchJsonFromBase<T>(
    baseUrl: string,
    upstreamName: string,
    path: string,
    authorization?: string,
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        ...(authorization ? { authorization } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Upstream ${upstreamName} failed ${res.status} for ${path}: ${body}`);
    }

    return (await res.json()) as T;
  }

  private async patchJsonFromBase<T>(
    baseUrl: string,
    upstreamName: string,
    path: string,
    body: Record<string, unknown>,
    authorization?: string,
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
        ...(authorization ? { authorization } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const resBody = await res.text().catch(() => '');
      throw new Error(`Upstream ${upstreamName} failed ${res.status} for ${path}: ${resBody}`);
    }

    return (await res.json()) as T;
  }

  private toUserName(detail: UpstreamApplyDetail): string {
    const firstName = detail.user?.first_name?.trim() ?? '';
    const lastName = detail.user?.last_name?.trim() ?? '';
    return `${firstName} ${lastName}`.trim() || 'Unknown Candidate';
  }

  private toApplyStatusName(status: number, statuses: UpstreamReferenceStatus[]): StatusName {
    const found = statuses.find((item) => item.id === status);
    return {
      th: found?.text_th ?? 'ไม่ทราบสถานะ',
      en: found?.text_eng ?? 'Unknown',
    };
  }

  private toJobStatusName(status: number, statuses: UpstreamReferenceStatus[]): string {
    return statuses.find((item) => item.id === status)?.text_eng ?? 'Unknown';
  }

  private toApplyCard(item: UpstreamApplyDetail, applyStatuses: UpstreamReferenceStatus[]) {
    return {
      id: item.id,
      status: item.status,
      status_name: {
        th: this.toApplyStatusName(item.status, applyStatuses).th,
        en: this.toApplyStatusName(item.status, applyStatuses).en,
      },
      created_at: item.created_at,
      user_name: this.toUserName(item),
      job_id: item.job_id,
      job_name: item.job?.name ?? '',
      match_skill: item.match_skill ?? 0,
      is_viewed: item.is_viewed,
      is_star: item.is_star,
    };
  }

  private async getApplyDetailsWithStatuses(authorization?: string) {
    const [applySummaries, applyStatuses] = await Promise.all([
      this.fetchJson<UpstreamApplySummary[]>('/apply', authorization),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/apply-status', authorization),
    ]);

    const applyDetails = await Promise.all(
      applySummaries.map((item) =>
        this.fetchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(item.id)}`, authorization),
      ),
    );

    return { applyDetails, applyStatuses };
  }

  private async getApplyRowsWithResumeAndStatuses(authorization?: string) {
    const { applyDetails, applyStatuses } = await this.getApplyDetailsWithStatuses(authorization);
    const resumeIds = Array.from(
      new Set(
        applyDetails
          .map((item) => item.resume_id)
          .filter((id): id is string => typeof id === 'string' && id.length > 0),
      ),
    );

    const resumeEntries = await Promise.all(
      resumeIds.map(async (resumeId) => {
        const resume = await this.fetchJson<UpstreamResumeDetail>(
          `/resume/${encodeURIComponent(resumeId)}`,
          authorization,
        );
        return [resumeId, resume] as const;
      }),
    );

    const resumeById = new Map<string, UpstreamResumeDetail>(resumeEntries);
    const rows: ApplyWithResumeRow[] = applyDetails.map((apply) => ({
      apply,
      resumeDetail:
        (apply.resume_id ? resumeById.get(apply.resume_id) : null) ??
        (apply.resume as UpstreamResumeDetail | undefined) ??
        null,
    }));

    return { rows, applyStatuses };
  }

  private buildPaginatedApplyResponse(
    details: UpstreamApplyDetail[],
    applyStatuses: UpstreamReferenceStatus[],
    page: number,
    limit: number,
  ) {
    const start = page * limit;
    const data = details
      .slice(start, start + limit)
      .map((item) => this.toApplyCard(item, applyStatuses));

    return {
      data,
      page,
      limit,
      total: details.length,
    };
  }

  private getSearchText(query: SearchApplyMonitorDto): string {
    return (query.search ?? query.applyName ?? '').trim().toLowerCase();
  }

  private countArray(value: unknown): number {
    return Array.isArray(value) ? value.length : 0;
  }

  private calculateYearExperience(resumeDetail: UpstreamResumeDetail | null): number {
    const workExperiences = resumeDetail?.work_experiences;
    if (!Array.isArray(workExperiences) || workExperiences.length === 0) {
      return 0;
    }

    let totalYears = 0;
    for (const item of workExperiences) {
      const startAt = item?.start_date ? new Date(item.start_date) : null;
      if (!startAt || Number.isNaN(startAt.getTime())) {
        continue;
      }
      const endAt = item?.end_date ? new Date(item.end_date) : new Date();
      if (Number.isNaN(endAt.getTime()) || endAt < startAt) {
        continue;
      }

      const years = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      totalYears += years;
    }
    return totalYears;
  }

  private matchesApplyFilters(
    item: UpstreamApplyDetail,
    resumeDetail: UpstreamResumeDetail | null,
    query: SearchApplyMonitorDto,
    applyStatuses: UpstreamReferenceStatus[],
  ): boolean {
    const searchText = this.getSearchText(query);
    const bySearch = !searchText || this.toUserName(item).toLowerCase().includes(searchText);

    const statusName = this.toApplyStatusName(item.status, applyStatuses).en.toLowerCase();
    const byStatusId = query.applyStatusId === undefined || item.status === query.applyStatusId;
    const byStatusName = !query.applyStatus || statusName === query.applyStatus.toLowerCase();

    const byStar = query.starredOnly !== true || item.is_star;

    const userSkillCount = this.countArray(resumeDetail?.skills);
    const experienceCount = this.countArray(resumeDetail?.work_experiences);
    const achievementCount = this.countArray(resumeDetail?.achievements);
    const projectCount = this.countArray(resumeDetail?.projects);
    const yearExperience = this.calculateYearExperience(resumeDetail);

    const byUserSkill =
      query.userSkillMoreThan === undefined || userSkillCount > query.userSkillMoreThan;
    const byExperience =
      query.experienceMoreThan === undefined || experienceCount > query.experienceMoreThan;
    const byAchievement =
      query.achievementMoreThan === undefined || achievementCount > query.achievementMoreThan;
    const byProject = query.projectMoreThan === undefined || projectCount > query.projectMoreThan;
    const byYearExperience =
      query.yearExperienceMoreThan === undefined || yearExperience > query.yearExperienceMoreThan;

    return (
      bySearch &&
      byStatusId &&
      byStatusName &&
      byStar &&
      byUserSkill &&
      byExperience &&
      byAchievement &&
      byProject &&
      byYearExperience
    );
  }

  async getApplySearchOptions(authorization?: string) {
    const [applyStatuses, jobStatuses, workTypes] = await Promise.all([
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/apply-status', authorization),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/job-status', authorization),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/work-types', authorization),
    ]);

    return {
      applyStatus: applyStatuses
        .map((item) => item.text_eng)
        .filter((item): item is string => !!item),
      jobStatus: jobStatuses.map((item) => item.text_eng).filter((item): item is string => !!item),
      workType: workTypes.map((item) => item.text_eng).filter((item): item is string => !!item),
      sortBy: ['newest', 'oldest', 'skill_match'],
    };
  }

  async getApplyStatusList(authorization?: string) {
    const applyStatuses = await this.fetchJson<UpstreamReferenceStatus[]>(
      '/reference/apply-status',
      authorization,
    );

    return {
      data: applyStatuses.map((item) => ({
        id: item.id,
        text_th: item.text_th,
        text_eng: item.text_eng,
      })),
    };
  }

  async getJobSearchOptions(authorization?: string) {
    const [jobStatuses, workTypes] = await Promise.all([
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/job-status', authorization),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/work-types', authorization),
    ]);

    return {
      jobStatus: jobStatuses.map((item) => item.text_eng).filter((item): item is string => !!item),
      workType: workTypes.map((item) => item.text_eng).filter((item): item is string => !!item),
      sortBy: ['newest', 'oldest', 'most_applied'],
    };
  }

  async searchJobSkillOptions(searchName: string, authorization?: string) {
    const query = searchName.trim();
    if (!query) {
      return { skills: [] };
    }

    const encodedSearch = encodeURIComponent(query);
    const rows = await this.fetchJsonFromBase<UpstreamNeo4jSkillSearchItem[]>(
      this.neo4jBaseUrl(),
      '@jobby-db-neo4j',
      `/graph/element-id/lookup/skills/search/${encodedSearch}`,
      authorization,
    );

    return {
      skills: rows.map((item) => ({
        eid: item.eid,
        name: item.name ?? '',
      })),
    };
  }

  async getApplyDetail(id: string, authorization?: string) {
    const [detail, applyStatuses] = await Promise.all([
      this.fetchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(id)}`, authorization),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/apply-status', authorization),
    ]);

    const resumeDetail =
      detail.resume_id != null
        ? await this.fetchJson<UpstreamResumeDetail>(
            `/resume/${encodeURIComponent(detail.resume_id)}`,
            authorization,
          )
        : (detail.resume ?? null);

    return {
      id: detail.id,
      status: detail.status,
      status_name: this.toApplyStatusName(detail.status, applyStatuses),
      created_at: detail.created_at,
      user_name: this.toUserName(detail),
      job_id: detail.job_id,
      job_name: detail.job?.name ?? '',
      match_skill: detail.match_skill ?? 0,
      is_viewed: detail.is_viewed,
      is_star: detail.is_star,
      user: detail.user ?? null,
      job: detail.job ?? null,
      resume_detail: resumeDetail,
    };
  }

  async getJobDetail(jobId: string, authorization?: string) {
    const [jobDetail, jobStatuses] = await Promise.all([
      this.fetchJson<UpstreamJobDetail>(`/job/${encodeURIComponent(jobId)}`, authorization),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/job-status', authorization),
    ]);

    const status = typeof jobDetail.status === 'number' ? jobDetail.status : 0;

    return {
      ...jobDetail,
      status_name: this.toJobStatusName(status, jobStatuses),
    };
  }

  async getApplyByJobId(jobId: string, query: SearchApplyMonitorDto, authorization?: string) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 6;
    const { rows, applyStatuses } = await this.getApplyRowsWithResumeAndStatuses(authorization);

    const filtered = rows
      .filter(
        (row) =>
          row.apply.job_id === jobId &&
          this.matchesApplyFilters(row.apply, row.resumeDetail, query, applyStatuses),
      )
      .map((row) => row.apply);

    return this.buildPaginatedApplyResponse(filtered, applyStatuses, page, limit);
  }

  async getNewAppliedByJobId(jobId: string, query: SearchApplyMonitorDto, authorization?: string) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 6;
    const { rows, applyStatuses } = await this.getApplyRowsWithResumeAndStatuses(authorization);

    const filtered = rows
      .filter(
        (row) =>
          row.apply.job_id === jobId &&
          row.apply.status === APPLY_STATUS_ID.APPLY &&
          !row.apply.is_viewed &&
          this.matchesApplyFilters(row.apply, row.resumeDetail, query, applyStatuses),
      )
      .map((row) => row.apply);

    return this.buildPaginatedApplyResponse(filtered, applyStatuses, page, limit);
  }

  async getAppliedByJobId(jobId: string, query: SearchApplyMonitorDto, authorization?: string) {
    return this.getApplyByJobStatus(jobId, APPLY_STATUS_ID.APPLIED, query, authorization);
  }

  async getInterviewByJobId(jobId: string, query: SearchApplyMonitorDto, authorization?: string) {
    return this.getApplyByJobStatus(jobId, APPLY_STATUS_ID.INTERVIEW, query, authorization);
  }

  async getAcceptByJobId(jobId: string, query: SearchApplyMonitorDto, authorization?: string) {
    return this.getApplyByJobStatus(jobId, APPLY_STATUS_ID.ACCEPT, query, authorization);
  }

  async getRejectByJobId(jobId: string, query: SearchApplyMonitorDto, authorization?: string) {
    return this.getApplyByJobStatus(jobId, APPLY_STATUS_ID.REJECT, query, authorization);
  }

  async starApply(id: string, isStar: boolean, authorization?: string) {
    const [updated, applyStatuses] = await Promise.all([
      this.patchJson<UpstreamApplyDetail>(
        `/apply/${encodeURIComponent(id)}`,
        { is_star: isStar },
        authorization,
      ),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/apply-status', authorization),
    ]);

    return {
      id: updated.id,
      status: updated.status,
      status_name: this.toApplyStatusName(updated.status, applyStatuses),
      created_at: updated.created_at,
      user_name: this.toUserName(updated),
      job_id: updated.job_id,
      job_name: updated.job?.name ?? '',
      match_skill: updated.match_skill ?? 0,
      is_viewed: updated.is_viewed,
      is_star: updated.is_star,
    };
  }

  async updateApplyStatus(id: string, status: number, authorization?: string) {
    const [updated, applyStatuses] = await Promise.all([
      this.patchJson<UpstreamApplyDetail>(
        `/apply/${encodeURIComponent(id)}`,
        { status },
        authorization,
      ),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/apply-status', authorization),
    ]);

    return {
      id: updated.id,
      status: updated.status,
      status_name: this.toApplyStatusName(updated.status, applyStatuses),
      created_at: updated.created_at,
      user_name: this.toUserName(updated),
      job_id: updated.job_id,
      job_name: updated.job?.name ?? '',
      match_skill: updated.match_skill ?? 0,
      is_viewed: updated.is_viewed,
      is_star: updated.is_star,
    };
  }

  async searchApply(query: SearchApplyMonitorDto, authorization?: string) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 6;
    const { applyDetails, applyStatuses } = await this.getApplyDetailsWithStatuses(authorization);

    const filtered = applyDetails.filter((item) => {
      const statusName = this.toApplyStatusName(item.status, applyStatuses);
      const byApplyName =
        !query.applyName ||
        this.toUserName(item).toLowerCase().includes(query.applyName.toLowerCase());
      const byApplyStatus =
        !query.applyStatus || statusName.en.toLowerCase() === query.applyStatus.toLowerCase();
      const byJobName =
        !query.jobName ||
        (item.job?.name ?? '').toLowerCase().includes(query.jobName.toLowerCase());
      return byApplyName && byApplyStatus && byJobName;
    });

    return this.buildPaginatedApplyResponse(filtered, applyStatuses, page, limit);
  }

  async searchJob(query: SearchApplyMonitorDto, authorization?: string) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 6;

    const [jobs, applySummaries, jobStatuses] = await Promise.all([
      this.fetchJson<UpstreamJobSummary[]>('/job', authorization),
      this.fetchJson<UpstreamApplySummary[]>('/apply', authorization),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/job-status', authorization),
    ]);

    const applyDetails = await Promise.all(
      applySummaries.map((item) =>
        this.fetchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(item.id)}`, authorization),
      ),
    );

    const filtered = jobs.filter((item) => {
      const byJobName =
        !query.jobName || (item.name ?? '').toLowerCase().includes(query.jobName.toLowerCase());
      const byJobStatus =
        !query.jobStatus ||
        this.toJobStatusName(item.status, jobStatuses).toLowerCase() ===
          query.jobStatus.toLowerCase();
      return byJobName && byJobStatus;
    });

    const start = page * limit;
    const items = filtered.slice(start, start + limit).map((job) => {
      const relatedApplies = applyDetails.filter((apply) => apply.job_id === job.id);
      const newAppliedCount = relatedApplies.filter((apply) => !apply.is_viewed).length;

      return {
        job_id: job.id,
        job_name: job.name ?? '',
        status: this.toJobStatusName(job.status, jobStatuses),
        date_range: [job.start_apply, job.end_apply].filter(Boolean).join(' - '),
        applied_count: relatedApplies.length,
        new_applied_count: newAppliedCount,
      };
    });

    return {
      section: 'job',
      total: filtered.length,
      page,
      limit,
      items,
    };
  }

  private async getApplyByJobStatus(
    jobId: string,
    statusId: number,
    query: SearchApplyMonitorDto,
    authorization?: string,
  ) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 6;
    const { rows, applyStatuses } = await this.getApplyRowsWithResumeAndStatuses(authorization);

    const filtered = rows
      .filter(
        (row) =>
          row.apply.job_id === jobId &&
          row.apply.status === statusId &&
          this.matchesApplyFilters(row.apply, row.resumeDetail, query, applyStatuses),
      )
      .map((row) => row.apply);

    return this.buildPaginatedApplyResponse(filtered, applyStatuses, page, limit);
  }
}
