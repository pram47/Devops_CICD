import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchApplyMonitorDto } from './dto/search-apply-monitor.dto';

type UpstreamApplySummary = {
  id: string;
  status: number;
  created_at: string | null;
  company_id?: string | null;
};

type UpstreamApplyDetail = {
  id: string;
  status: number;
  created_at: string | null;
  company_id?: string | null;
  job_id: string;
  resume_id?: string | null;
  match_skill: number | null;
  is_viewed: boolean;
  is_star: boolean;
  cover_letter?: string | null;
  cover_letter_file_name?: string | null;
  cover_letter_mime_type?: string | null;
  cover_letter_size_bytes?: number | null;
  cover_letter_bucket?: string | null;
  cover_letter_object_key?: string | null;
  cover_letter_uploaded_at?: string | null;
  cover_letter_metadata?: Record<string, unknown> | null;
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
    resume_file?: string | null;
    resume_file_metadata?: Record<string, unknown> | null;
  } | null;
};

type UpstreamResumeWorkExperience = {
  start_date?: string | null;
  end_date?: string | null;
};

type UpstreamResumeDetail = Record<string, unknown> & {
  resume_file?: string | null;
  resume_file_metadata?: Record<string, unknown> | null;
  skills?: unknown[];
  work_experiences?: UpstreamResumeWorkExperience[];
  achievements?: unknown[];
  projects?: unknown[];
};

type UpstreamJobSummary = {
  id: string;
  company_id?: string | null;
  name: string | null;
  status: number;
  start_apply: string | null;
  end_apply: string | null;
};

type UpstreamJobDetail = Record<string, unknown> & {
  id?: string;
  company_id?: string | null;
  name?: string | null;
  status?: number;
};

type UpstreamCompanyEmployee = {
  id: string;
  user_id?: string | null;
  company_id: string;
  email?: string | null;
  role: number;
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

type OptionItem = {
  id: number;
  text_th: string | null;
  text_eng: string | null;
};

type SortByItem = {
  id: number;
  text_th: string;
  text_eng: string;
};

type ApplyWithResumeRow = {
  apply: UpstreamApplyDetail;
  resumeDetail: UpstreamResumeDetail | null;
};

const SORT_BY = {
  NEWEST: 1,
  OLDEST: 2,
  SKILL_MATCH: 3,
  MOST_APPLIED: 4,
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

  private async fetchJson<T>(path: string): Promise<T> {
    return this.fetchJsonFromBase<T>(this.postgresBaseUrl(), '@jobby-db-postgres', path);
  }

  private async patchJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
    return this.patchJsonFromBase<T>(this.postgresBaseUrl(), '@jobby-db-postgres', path, body);
  }

  private async fetchJsonFromBase<T>(
    baseUrl: string,
    upstreamName: string,
    path: string,
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url);

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
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const resBody = await res.text().catch(() => '');
      throw new Error(`Upstream ${upstreamName} failed ${res.status} for ${path}: ${resBody}`);
    }

    return (await res.json()) as T;
  }

  private hasCompanyAccess(
    assignedCompanyIds: Set<string>,
    companyId: string | null | undefined,
  ): boolean {
    return (
      typeof companyId === 'string' && companyId.length > 0 && assignedCompanyIds.has(companyId)
    );
  }

  private async resolveAssignedCompanyIds(authUserId: string): Promise<Set<string>> {
    const userId = authUserId.trim();
    if (!userId) {
      return new Set<string>();
    }

    const rows = await this.fetchJson<UpstreamCompanyEmployee[]>(
      `/company/employee/${encodeURIComponent(userId)}`,
    );

    return new Set(
      rows
        .map((row) => row.company_id)
        .filter(
          (companyId): companyId is string => typeof companyId === 'string' && companyId.length > 0,
        ),
    );
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

  private async getApplyDetailsWithStatuses(assignedCompanyIds: Set<string>) {
    const [applySummaries, applyStatuses] = await Promise.all([
      this.fetchJson<UpstreamApplySummary[]>('/apply'),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/apply-status'),
    ]);

    const companyScopedSummaries = applySummaries.filter((item) =>
      this.hasCompanyAccess(assignedCompanyIds, item.company_id),
    );

    const applyDetails = await Promise.all(
      companyScopedSummaries.map((item) =>
        this.fetchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(item.id)}`),
      ),
    );

    return { applyDetails, applyStatuses };
  }

  private async getApplyRowsWithResumeAndStatuses(assignedCompanyIds: Set<string>) {
    const { applyDetails, applyStatuses } =
      await this.getApplyDetailsWithStatuses(assignedCompanyIds);
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

  private parseDateMs(value: string | null | undefined): number {
    if (!value) return 0;
    const ms = new Date(value).getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }

  private applySortForApplies(items: UpstreamApplyDetail[], sortById: number | undefined) {
    const sortId = sortById ?? SORT_BY.NEWEST;
    if (sortId === SORT_BY.OLDEST) {
      items.sort((a, b) => this.parseDateMs(a.created_at) - this.parseDateMs(b.created_at));
      return;
    }

    if (sortId === SORT_BY.SKILL_MATCH) {
      items.sort((a, b) => (b.match_skill ?? 0) - (a.match_skill ?? 0));
      return;
    }

    // default newest
    items.sort((a, b) => this.parseDateMs(b.created_at) - this.parseDateMs(a.created_at));
  }

  private getSearchText(query: SearchApplyMonitorDto): string {
    return (query.search ?? '').trim().toLowerCase();
  }

  private countArray(value: unknown): number {
    return Array.isArray(value) ? value.length : 0;
  }

  private parseSkillFilter(query: SearchApplyMonitorDto): string[] {
    const raw = (query.skillIds ?? '').trim();
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) {
        return [];
      }
      return parsed
        .map((item) => (typeof item === 'string' || typeof item === 'number' ? String(item) : ''))
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    } catch {
      // Backward-compatible fallback for comma-separated query style.
      return raw
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }

  private extractSkillIdsFromResume(resumeDetail: UpstreamResumeDetail | null): Set<string> {
    const skills = resumeDetail?.skills;
    if (!Array.isArray(skills)) {
      return new Set<string>();
    }

    const ids = skills
      .map((skill) => {
        if (!skill || typeof skill !== 'object') {
          return '';
        }

        const record = skill as Record<string, unknown>;
        const candidate =
          record.skill_id ??
          record.id ??
          record.eid ??
          record.skill_element_id ??
          record.skillElementId;

        return typeof candidate === 'string' || typeof candidate === 'number'
          ? String(candidate).trim()
          : '';
      })
      .filter((id) => id.length > 0);

    return new Set(ids);
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
  ): boolean {
    const requestedSkillIds = this.parseSkillFilter(query);
    const searchText = this.getSearchText(query);
    const bySearch = !searchText || this.toUserName(item).toLowerCase().includes(searchText);

    const byStatusId = query.applyStatusId === undefined || item.status === query.applyStatusId;

    const byStar = query.starredOnly !== true || item.is_star;

    const resumeSkillIds = this.extractSkillIdsFromResume(resumeDetail);
    const bySkill =
      requestedSkillIds.length === 0 ||
      requestedSkillIds.some((requestedId) => resumeSkillIds.has(requestedId));

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
      byStar &&
      bySkill &&
      byUserSkill &&
      byExperience &&
      byAchievement &&
      byProject &&
      byYearExperience
    );
  }

  private toOptionItem(item: UpstreamReferenceStatus): OptionItem {
    return {
      id: item.id,
      text_th: item.text_th ?? null,
      text_eng: item.text_eng ?? null,
    };
  }

  async getOptions(_authUserId: string) {
    const [applyStatuses] = await Promise.all([
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/apply-status'),
    ]);

    const sortBy: SortByItem[] = [
      { id: SORT_BY.NEWEST, text_th: 'ใหม่สุด', text_eng: 'newest' },
      { id: SORT_BY.OLDEST, text_th: 'เก่าสุด', text_eng: 'oldest' },
      { id: SORT_BY.SKILL_MATCH, text_th: 'ตรงทักษะมากสุด', text_eng: 'skill_match' },
      { id: SORT_BY.MOST_APPLIED, text_th: 'ผู้สมัครเยอะสุด', text_eng: 'most_applied' },
    ];

    return {
      applyStatus: applyStatuses.map((item) => this.toOptionItem(item)),
      sortBy,
    };
  }

  async searchJobSkillOptions(_authUserId: string, searchName: string) {
    const query = searchName.trim();
    if (!query) {
      return { skills: [] };
    }

    const encodedSearch = encodeURIComponent(query);
    const rows = await this.fetchJsonFromBase<UpstreamNeo4jSkillSearchItem[]>(
      this.neo4jBaseUrl(),
      '@jobby-db-neo4j',
      `/graph/element-id/lookup/skills/search/${encodedSearch}`,
    );

    return {
      skills: rows.map((item) => ({
        eid: item.eid,
        name: item.name ?? '',
      })),
    };
  }

  async getApplyDetail(authUserId: string, id: string) {
    const assignedCompanyIds = await this.resolveAssignedCompanyIds(authUserId);
    const [detail, applyStatuses] = await Promise.all([
      this.fetchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(id)}`),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/apply-status'),
    ]);

    if (!this.hasCompanyAccess(assignedCompanyIds, detail.company_id)) {
      throw new ForbiddenException('No permission to access this apply');
    }

    const resumeDetail =
      detail.resume_id != null
        ? await this.fetchJson<UpstreamResumeDetail>(
            `/resume/${encodeURIComponent(detail.resume_id)}`,
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
      cover_letter: detail.cover_letter ?? null,
      cover_letter_file_name: detail.cover_letter_file_name ?? null,
      cover_letter_mime_type: detail.cover_letter_mime_type ?? null,
      cover_letter_size_bytes: detail.cover_letter_size_bytes ?? null,
      cover_letter_bucket: detail.cover_letter_bucket ?? null,
      cover_letter_object_key: detail.cover_letter_object_key ?? null,
      cover_letter_uploaded_at: detail.cover_letter_uploaded_at ?? null,
      cover_letter_metadata: detail.cover_letter_metadata ?? null,
      resume_file: (resumeDetail?.resume_file as string | null | undefined) ?? null,
      resume_file_metadata:
        (resumeDetail?.resume_file_metadata as Record<string, unknown> | null | undefined) ?? null,
      resume_detail: resumeDetail,
    };
  }

  async getJobDetail(authUserId: string, jobId: string) {
    const assignedCompanyIds = await this.resolveAssignedCompanyIds(authUserId);
    const [jobDetail, jobStatuses] = await Promise.all([
      this.fetchJson<UpstreamJobDetail>(`/job/${encodeURIComponent(jobId)}`),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/job-status'),
    ]);

    if (!this.hasCompanyAccess(assignedCompanyIds, jobDetail.company_id)) {
      throw new ForbiddenException('No permission to access this job');
    }

    const status = typeof jobDetail.status === 'number' ? jobDetail.status : 0;

    return {
      ...jobDetail,
      status_name: this.toJobStatusName(status, jobStatuses),
    };
  }

  async getApplyByJobId(authUserId: string, jobId: string, query: SearchApplyMonitorDto) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 6;
    const assignedCompanyIds = await this.resolveAssignedCompanyIds(authUserId);
    const { rows, applyStatuses } =
      await this.getApplyRowsWithResumeAndStatuses(assignedCompanyIds);

    const filtered = rows
      .filter(
        (row) =>
          row.apply.job_id === jobId &&
          this.matchesApplyFilters(row.apply, row.resumeDetail, query),
      )
      .map((row) => row.apply);

    this.applySortForApplies(filtered, query.sortById);
    return this.buildPaginatedApplyResponse(filtered, applyStatuses, page, limit);
  }

  async starApply(authUserId: string, id: string, isStar: boolean) {
    const assignedCompanyIds = await this.resolveAssignedCompanyIds(authUserId);
    const current = await this.fetchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(id)}`);
    if (!this.hasCompanyAccess(assignedCompanyIds, current.company_id)) {
      throw new ForbiddenException('No permission to update this apply');
    }

    const [updated, applyStatuses] = await Promise.all([
      this.patchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(id)}`, { is_star: isStar }),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/apply-status'),
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

  async updateApplyStatus(authUserId: string, id: string, status: number) {
    const assignedCompanyIds = await this.resolveAssignedCompanyIds(authUserId);
    const current = await this.fetchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(id)}`);
    if (!this.hasCompanyAccess(assignedCompanyIds, current.company_id)) {
      throw new ForbiddenException('No permission to update this apply');
    }

    const [updated, applyStatuses] = await Promise.all([
      this.patchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(id)}`, { status }),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/apply-status'),
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

  async updateApplyViewed(authUserId: string, id: string, isViewed: boolean) {
    const assignedCompanyIds = await this.resolveAssignedCompanyIds(authUserId);
    const current = await this.fetchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(id)}`);
    if (!this.hasCompanyAccess(assignedCompanyIds, current.company_id)) {
      throw new ForbiddenException('No permission to update this apply');
    }

    const [updated, applyStatuses] = await Promise.all([
      this.patchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(id)}`, {
        is_viewed: isViewed,
      }),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/apply-status'),
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

  async searchApply(authUserId: string, query: SearchApplyMonitorDto) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 6;
    const assignedCompanyIds = await this.resolveAssignedCompanyIds(authUserId);
    const { rows, applyStatuses } =
      await this.getApplyRowsWithResumeAndStatuses(assignedCompanyIds);
    const filtered = rows
      .filter((row) => this.matchesApplyFilters(row.apply, row.resumeDetail, query))
      .map((row) => row.apply);

    this.applySortForApplies(filtered, query.sortById);
    return this.buildPaginatedApplyResponse(filtered, applyStatuses, page, limit);
  }

  async searchJob(authUserId: string, query: SearchApplyMonitorDto) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 6;
    const assignedCompanyIds = await this.resolveAssignedCompanyIds(authUserId);

    const [jobs, applySummaries, jobStatuses] = await Promise.all([
      this.fetchJson<UpstreamJobSummary[]>('/job'),
      this.fetchJson<UpstreamApplySummary[]>('/apply'),
      this.fetchJson<UpstreamReferenceStatus[]>('/reference/job-status'),
    ]);

    const scopedJobs = jobs.filter((job) =>
      this.hasCompanyAccess(assignedCompanyIds, job.company_id),
    );
    const scopedApplySummaries = applySummaries.filter((item) =>
      this.hasCompanyAccess(assignedCompanyIds, item.company_id),
    );

    const applyDetails = await Promise.all(
      scopedApplySummaries.map((item) =>
        this.fetchJson<UpstreamApplyDetail>(`/apply/${encodeURIComponent(item.id)}`),
      ),
    );

    const filtered = scopedJobs;

    const jobCards = filtered.map((job) => {
      const relatedApplies = applyDetails.filter((apply) => apply.job_id === job.id);
      const newAppliedCount = relatedApplies.filter((apply) => !apply.is_viewed).length;

      return {
        job_id: job.id,
        job_name: job.name ?? '',
        status: this.toJobStatusName(job.status, jobStatuses),
        date_range: [job.start_apply, job.end_apply].filter(Boolean).join(' - '),
        applied_count: relatedApplies.length,
        new_applied_count: newAppliedCount,
        _created_at: job.start_apply ?? job.end_apply ?? null,
      };
    });

    const sortId = query.sortById ?? SORT_BY.NEWEST;
    if (sortId === SORT_BY.OLDEST) {
      jobCards.sort((a, b) => this.parseDateMs(a._created_at) - this.parseDateMs(b._created_at));
    } else if (sortId === SORT_BY.MOST_APPLIED) {
      jobCards.sort((a, b) => b.applied_count - a.applied_count);
    } else {
      jobCards.sort((a, b) => this.parseDateMs(b._created_at) - this.parseDateMs(a._created_at));
    }

    const start = page * limit;
    const items = jobCards.slice(start, start + limit).map(({ _created_at, ...rest }) => rest);

    return {
      section: 'job',
      total: filtered.length,
      page,
      limit,
      items,
    };
  }
}
