import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UtilityService } from '../utility/utility.service';
import { SearchCompanyJobDto } from './dto/search-company-job.dto';
import { UpdateCompanyAboutDto } from './dto/update-company-about.dto';
import { UpdateCompanyAdditionInformationDto } from './dto/update-company-addition-information.dto';
import { UpdateCompanyInfoDto } from './dto/update-company-info.dto';

type UpstreamCompanyEmployee = {
  company_id: string;
};

type UpstreamJobSummary = {
  id: string;
  company_id?: string | null;
  name: string | null;
  status: number;
  created_at: string | null;
  start_apply: string | null;
  end_apply: string | null;
};

type UpstreamApplySummary = {
  id: string;
  job_id: string;
  company_id?: string | null;
};

type UpstreamJobDetail = Record<string, unknown> & {
  id?: string;
  province?: Record<string, unknown> | null;
  district?: Record<string, unknown> | null;
};

type UpstreamCompany = {
  id: string;
  logo?: string | null;
  banner?: string | null;
};

@Injectable()
export class CompanyService {
  constructor(
    private readonly config: ConfigService,
    private readonly utilityService: UtilityService,
  ) {}

  private postgresBaseUrl(): string {
    const url = this.config.get<string>('JOBBY_DB_POSTGRES_URL');
    if (!url) {
      throw new Error('Missing env JOBBY_DB_POSTGRES_URL for jobby-employer-bff');
    }
    return url.replace(/\/+$/, '');
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
      if (res.status === 400) {
        let message = resBody;
        try {
          const j = JSON.parse(resBody) as { message?: unknown };
          if (typeof j.message === 'string') {
            message = j.message;
          } else if (Array.isArray(j.message)) {
            message = j.message.map(String).join('; ');
          }
        } catch {
          /* keep resBody */
        }
        throw new BadRequestException(message || 'Bad request');
      }
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

  private async ensureCompanyAccess(authUserId: string, companyId: string): Promise<void> {
    const assignedCompanies = await this.fetchJson<UpstreamCompanyEmployee[]>(
      `/company/employee/${encodeURIComponent(authUserId)}`,
    );

    const hasAccess = assignedCompanies.some((item) => item.company_id === companyId);
    if (!hasAccess) {
      throw new ForbiddenException('No permission to access this company');
    }
  }

  private parseStorageGoogleapisObject(
    url: string | null | undefined,
  ): { bucket: string; objectName: string } | undefined {
    if (!url) return undefined;
    try {
      const parsed = new URL(url);
      if (parsed.hostname !== 'storage.googleapis.com') {
        return undefined;
      }
      const pathname = parsed.pathname.replace(/^\/+/, '');
      const slashAt = pathname.indexOf('/');
      if (slashAt <= 0) {
        return undefined;
      }
      const bucket = pathname.slice(0, slashAt);
      const objectName = decodeURIComponent(pathname.slice(slashAt + 1));
      if (!bucket || !objectName) {
        return undefined;
      }
      return { bucket, objectName };
    } catch {
      return undefined;
    }
  }

  async getCompany(authUserId: string, companyId: string) {
    await this.ensureCompanyAccess(authUserId, companyId);
    return this.fetchJson<Record<string, unknown>>(`/company/${encodeURIComponent(companyId)}`);
  }

  async getCompanyIdsByUserId(userId: string) {
    const memberships = await this.fetchJson<UpstreamCompanyEmployee[]>(
      `/company/employee/${encodeURIComponent(userId)}`,
    );
    const company_ids = [...new Set(memberships.map((row) => row.company_id).filter(Boolean))];

    return {
      user_id: userId,
      company_id: company_ids[0] ?? null,
      company_ids,
    };
  }

  async updateCompanyInfo(authUserId: string, companyId: string, dto: UpdateCompanyInfoDto) {
    await this.ensureCompanyAccess(authUserId, companyId);
    return this.patchJson<Record<string, unknown>>(`/company/${encodeURIComponent(companyId)}`, {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.email !== undefined && { email: dto.email }),
      ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.phone_region !== undefined && { phone_region: dto.phone_region }),
      ...(dto.address_line !== undefined && { address_line: dto.address_line }),
      ...(dto.no !== undefined && { no: dto.no }),
      ...(dto.moo !== undefined && { moo: dto.moo }),
      ...(dto.soi !== undefined && { soi: dto.soi }),
      ...(dto.street !== undefined && { street: dto.street }),
      ...(dto.sub_district_id !== undefined && { sub_district_id: dto.sub_district_id }),
      ...(dto.district_id !== undefined && { district_id: dto.district_id }),
      ...(dto.province_id !== undefined && { province_id: dto.province_id }),
      ...(dto.country_id !== undefined && { country_id: dto.country_id }),
      ...(dto.postal_code_id !== undefined && { postal_code_id: dto.postal_code_id }),
      ...(dto.postal_code !== undefined && { postal_code: dto.postal_code }),
      ...(dto.contacts !== undefined && { contacts: dto.contacts }),
    });
  }

  async updateCompanyMedia(
    authUserId: string,
    companyId: string,
    files: { logo?: Express.Multer.File; banner?: Express.Multer.File },
  ) {
    await this.ensureCompanyAccess(authUserId, companyId);

    const current = await this.fetchJson<UpstreamCompany>(
      `/company/${encodeURIComponent(companyId)}`,
    );
    const previousLogo = this.parseStorageGoogleapisObject(current.logo);
    const previousBanner = this.parseStorageGoogleapisObject(current.banner);

    const patch: Record<string, unknown> = {};
    if (files.logo) {
      const uploadedLogo = await this.utilityService.uploadImage(
        files.logo,
        `company/${companyId}`,
      );
      patch.logo = uploadedLogo.publicUrl;
    }
    if (files.banner) {
      const uploadedBanner = await this.utilityService.uploadImage(
        files.banner,
        `company/${companyId}`,
      );
      patch.banner = uploadedBanner.publicUrl;
    }

    if (Object.keys(patch).length === 0) {
      // No-op: nothing to update
      return current as unknown as Record<string, unknown>;
    }

    const updated = await this.patchJson<Record<string, unknown>>(
      `/company/${encodeURIComponent(companyId)}`,
      patch,
    );

    // Best-effort cleanup: remove previous objects when replaced.
    if (files.logo && previousLogo) {
      await this.utilityService.deleteObject(previousLogo.objectName, previousLogo.bucket);
    }
    if (files.banner && previousBanner) {
      await this.utilityService.deleteObject(previousBanner.objectName, previousBanner.bucket);
    }

    return updated;
  }

  async updateCompanyVerifyFile(
    authUserId: string,
    companyId: string,
    files: { verify_file?: Express.Multer.File },
  ) {
    await this.ensureCompanyAccess(authUserId, companyId);

    const current = await this.fetchJson<UpstreamCompany>(
      `/company/${encodeURIComponent(companyId)}`,
    );
    const previousVerify = this.parseStorageGoogleapisObject(
      // company may not have this property; access safely
      (current as any).company_verify_file as string | undefined,
    );

    const patch: Record<string, unknown> = {};
    if (files.verify_file) {
      const uploadedVerify = await this.utilityService.uploadFile(
        files.verify_file,
        `company/${companyId}`,
      );
      patch.company_verify_file = uploadedVerify.publicUrl;
      patch.company_verify_file_name = files.verify_file.originalname;
      patch.company_verify_file_mime_type = uploadedVerify.contentType;
      patch.company_verify_file_size_bytes = uploadedVerify.size;
      patch.company_verify_file_bucket = uploadedVerify.bucket;
      patch.company_verify_file_object_key = uploadedVerify.objectName;
      patch.company_verify_file_uploaded_at = new Date().toISOString();
      patch.company_verify_file_metadata = {
        gs_uri: uploadedVerify.gsUri,
        signed_url: uploadedVerify.signedUrl ?? null,
      };
    }

    if (Object.keys(patch).length === 0) {
      return current as unknown as Record<string, unknown>;
    }

    const updated = await this.patchJson<Record<string, unknown>>(
      `/company/${encodeURIComponent(companyId)}`,
      patch,
    );

    // Best-effort cleanup: remove previous object when replaced.
    if (files.verify_file && previousVerify) {
      await this.utilityService.deleteObject(previousVerify.objectName, previousVerify.bucket);
    }

    return updated;
  }

  async updateCompanyAbout(authUserId: string, companyId: string, dto: UpdateCompanyAboutDto) {
    await this.ensureCompanyAccess(authUserId, companyId);
    return this.patchJson<Record<string, unknown>>(`/company/${encodeURIComponent(companyId)}`, {
      about: dto.about,
    });
  }

  async updateCompanyAdditionInformation(
    authUserId: string,
    companyId: string,
    dto: UpdateCompanyAdditionInformationDto,
  ) {
    await this.ensureCompanyAccess(authUserId, companyId);
    return this.patchJson<Record<string, unknown>>(`/company/${encodeURIComponent(companyId)}`, {
      addition_information: dto.addition_information,
      ...(dto.addition_information_rtf !== undefined && {
        addition_information_rtf: dto.addition_information_rtf,
      }),
    });
  }

  async getCompanyJobs(authUserId: string, companyId: string, query: SearchCompanyJobDto) {
    await this.ensureCompanyAccess(authUserId, companyId);

    const page = query.page ?? 0;
    const limit = query.limit ?? 10;

    const [jobs, applySummaries] = await Promise.all([
      this.fetchJson<UpstreamJobSummary[]>('/job'),
      this.fetchJson<UpstreamApplySummary[]>('/apply'),
    ]);

    const scopedJobs = jobs.filter((job) => job.company_id === companyId);
    const scopedApplies = applySummaries.filter((apply) => apply.company_id === companyId);

    const appliedCountByJobId = new Map<string, number>();
    for (const apply of scopedApplies) {
      appliedCountByJobId.set(apply.job_id, (appliedCountByJobId.get(apply.job_id) ?? 0) + 1);
    }

    const jobDetails = await Promise.all(
      scopedJobs.map((job) =>
        this.fetchJson<UpstreamJobDetail>(`/job/${encodeURIComponent(job.id)}`),
      ),
    );
    const detailByJobId = new Map<string, UpstreamJobDetail>(
      jobDetails
        .map((detail) => (detail.id ? ([detail.id, detail] as const) : null))
        .filter((row): row is readonly [string, UpstreamJobDetail] => row !== null),
    );

    const enriched = scopedJobs.map((job) => {
      const detail = detailByJobId.get(job.id);
      return {
        ...job,
        applied_count: appliedCountByJobId.get(job.id) ?? 0,
        province: detail?.province ?? null,
        district: detail?.district ?? null,
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
}
