import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchScoutDto } from './dto/search-scout.dto';

type UpstreamCompanyEmployee = {
  company_id: string;
};

type UpstreamCompany = {
  id: string;
  scout?: unknown;
};

type UpstreamJobSummary = {
  id: string;
  company_id?: string | null;
  name: string | null;
};

type UpstreamJobSkill = {
  skill_id?: string | null;
};

type UpstreamJobDetail = {
  id: string;
  skills?: UpstreamJobSkill[];
};

type UpstreamUserSummary = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  logo?: string | null;
};

type UpstreamUserDetail = {
  id: string;
  allow_scout?: boolean;
};

type UpstreamUserSkill = {
  skill_id?: string | null;
};

@Injectable()
export class ScoutService {
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

  private async patchJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
    const res = await fetch(`${this.postgresBaseUrl()}${path}`, {
      method: 'PATCH',
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

  private normalizeSkillId(skillId: string): string {
    return skillId.trim().toLowerCase();
  }

  private normalizeUserId(userId: string): string {
    return userId.trim();
  }

  private async resolveAssignedCompanyIds(authUserId: string): Promise<Set<string>> {
    const rows = await this.fetchJson<UpstreamCompanyEmployee[]>(
      `/company/employee/${encodeURIComponent(authUserId)}`,
    );
    return new Set(
      rows
        .map((row) => row.company_id)
        .filter(
          (companyId): companyId is string => typeof companyId === 'string' && companyId.length > 0,
        ),
    );
  }

  private async ensureCompanyAccess(authUserId: string, companyId: string): Promise<void> {
    const assignedCompanyIds = await this.resolveAssignedCompanyIds(authUserId);
    if (!assignedCompanyIds.has(companyId)) {
      throw new ForbiddenException('No permission to access this company');
    }
  }

  private normalizeFavoriteScoutIds(raw: unknown): string[] {
    if (!Array.isArray(raw)) {
      return [];
    }
    return Array.from(
      new Set(
        raw
          .map((item) => (typeof item === 'string' || typeof item === 'number' ? String(item) : ''))
          .map((item) => item.trim())
          .filter((item) => item.length > 0),
      ),
    );
  }

  private async resolveFavoriteScoutIds(
    authUserId: string,
    requestedCompanyId?: string,
  ): Promise<Set<string>> {
    const assignedCompanyIds = await this.resolveAssignedCompanyIds(authUserId);
    if (assignedCompanyIds.size === 0) {
      return new Set<string>();
    }

    const normalizedRequestedCompanyId = requestedCompanyId?.trim();
    const targetCompanyId =
      normalizedRequestedCompanyId && normalizedRequestedCompanyId.length > 0
        ? normalizedRequestedCompanyId
        : assignedCompanyIds.values().next().value;

    if (!targetCompanyId || !assignedCompanyIds.has(targetCompanyId)) {
      throw new ForbiddenException('No permission to access this company');
    }

    const company = await this.fetchJson<UpstreamCompany>(
      `/company/${encodeURIComponent(targetCompanyId)}`,
    );
    return new Set(this.normalizeFavoriteScoutIds(company.scout));
  }

  private resolveUserDisplayName(user: UpstreamUserSummary): string {
    const firstName = user.first_name?.trim() ?? '';
    const lastName = user.last_name?.trim() ?? '';
    return `${firstName} ${lastName}`.trim();
  }

  private async resolveCompanyJobSkillSet(
    authUserId: string,
    jobName?: string,
  ): Promise<Set<string>> {
    const companyRows = await this.fetchJson<UpstreamCompanyEmployee[]>(
      `/company/employee/${encodeURIComponent(authUserId)}`,
    );
    const companyIds = new Set(
      companyRows
        .map((row) => row.company_id)
        .filter(
          (companyId): companyId is string => typeof companyId === 'string' && companyId.length > 0,
        ),
    );
    if (companyIds.size === 0) {
      return new Set<string>();
    }

    const scopedJobName = (jobName ?? '').trim().toLowerCase();
    const jobs = await this.fetchJson<UpstreamJobSummary[]>('/job');
    const companyJobs = jobs.filter((job) => {
      const byCompany = typeof job.company_id === 'string' && companyIds.has(job.company_id);
      const byJobName = !scopedJobName || (job.name ?? '').toLowerCase().includes(scopedJobName);
      return byCompany && byJobName;
    });

    const details = await Promise.all(
      companyJobs.map((job) =>
        this.fetchJson<UpstreamJobDetail>(`/job/${encodeURIComponent(job.id)}`),
      ),
    );

    const skills = new Set<string>();
    for (const detail of details) {
      for (const skill of detail.skills ?? []) {
        if (!skill.skill_id) continue;
        skills.add(this.normalizeSkillId(skill.skill_id));
      }
    }

    return skills;
  }

  async getScouts(authUserId: string, query: SearchScoutDto) {
    const page = query.page ?? 0;
    const limit = query.limit ?? 10;
    const searchText = (query.search ?? '').trim().toLowerCase();

    const [companySkillSet, userSummaries, favoriteScoutIds] = await Promise.all([
      this.resolveCompanyJobSkillSet(authUserId, query.job_name),
      this.fetchJson<UpstreamUserSummary[]>('/user'),
      this.resolveFavoriteScoutIds(authUserId, query.company_id),
    ]);

    const detailedUsers = await Promise.all(
      userSummaries.map(async (user) => {
        const detail = await this.fetchJson<UpstreamUserDetail>(
          `/user/${encodeURIComponent(user.id)}`,
        );
        if (detail.allow_scout !== true) {
          return null;
        }

        const skills = await this.fetchJson<UpstreamUserSkill[]>(
          `/user/${encodeURIComponent(user.id)}/skills`,
        );
        const userSkillSet = new Set(
          skills
            .map((item) => item.skill_id)
            .filter(
              (skillId): skillId is string =>
                typeof skillId === 'string' && skillId.trim().length > 0,
            )
            .map((skillId) => this.normalizeSkillId(skillId)),
        );

        let matchSkill = 0;
        for (const skill of userSkillSet) {
          if (companySkillSet.has(skill)) {
            matchSkill += 1;
          }
        }

        return {
          id: user.id,
          email: user.email ?? null,
          first_name: user.first_name ?? null,
          last_name: user.last_name ?? null,
          logo: user.logo ?? null,
          user_name: this.resolveUserDisplayName(user),
          match_skill: matchSkill,
          is_star: favoriteScoutIds.has(user.id),
        };
      }),
    );

    const filtered = detailedUsers
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .filter((item) => {
        if (!searchText) {
          return true;
        }

        const byName = item.user_name.toLowerCase().includes(searchText);
        const byEmail = (item.email ?? '').toLowerCase().includes(searchText);
        return byName || byEmail;
      });

    filtered.sort((a, b) => {
      const byStar = Number(b.is_star) - Number(a.is_star);
      if (byStar !== 0) return byStar;
      const byMatchSkill = b.match_skill - a.match_skill;
      if (byMatchSkill !== 0) return byMatchSkill;
      return a.user_name.localeCompare(b.user_name);
    });

    const start = page * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      page,
      limit,
      total: filtered.length,
    };
  }

  async starScout(authUserId: string, companyId: string, userId: string, isStar: boolean) {
    const normalizedCompanyId = companyId.trim();
    const normalizedUserId = this.normalizeUserId(userId);
    if (!normalizedCompanyId) {
      throw new BadRequestException('companyId must not be empty');
    }
    if (!normalizedUserId) {
      throw new BadRequestException('userId must not be empty');
    }

    await this.ensureCompanyAccess(authUserId, normalizedCompanyId);
    const [company, userDetail] = await Promise.all([
      this.fetchJson<UpstreamCompany>(`/company/${encodeURIComponent(normalizedCompanyId)}`),
      this.fetchJson<UpstreamUserDetail>(`/user/${encodeURIComponent(normalizedUserId)}`),
    ]);

    if (userDetail.allow_scout !== true) {
      throw new BadRequestException('This user does not allow scout');
    }

    const currentIds = this.normalizeFavoriteScoutIds(company.scout);
    const nextIds = isStar
      ? Array.from(new Set([...currentIds, normalizedUserId]))
      : currentIds.filter((id) => id !== normalizedUserId);

    await this.patchJson<Record<string, unknown>>(
      `/company/${encodeURIComponent(normalizedCompanyId)}`,
      {
        scout: nextIds,
      },
    );

    return {
      company_id: normalizedCompanyId,
      user_id: normalizedUserId,
      is_star: nextIds.includes(normalizedUserId),
      scout: nextIds,
    };
  }
}
