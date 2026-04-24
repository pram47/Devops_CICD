import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SearchScoutDto } from './dto/search-scout.dto';

type UpstreamCompanyEmployee = {
  company_id: string;
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

  private normalizeSkillId(skillId: string): string {
    return skillId.trim().toLowerCase();
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

    const [companySkillSet, userSummaries] = await Promise.all([
      this.resolveCompanyJobSkillSet(authUserId, query.job_name),
      this.fetchJson<UpstreamUserSummary[]>('/user'),
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

    filtered.sort(
      (a, b) => b.match_skill - a.match_skill || a.user_name.localeCompare(b.user_name),
    );

    const start = page * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      page,
      limit,
      total: filtered.length,
    };
  }
}
