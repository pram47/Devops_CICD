import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UtilityService } from '../utility/utility.service';
import { UpdateCompanyAboutDto } from './dto/update-company-about.dto';
import { UpdateCompanyAdditionInformationDto } from './dto/update-company-addition-information.dto';
import { UpdateCompanyInfoDto } from './dto/update-company-info.dto';
import { UpdateCompanyMediaDto } from './dto/update-company-media.dto';

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

  async getCompany(authUserId: string, companyId: string) {
    await this.ensureCompanyAccess(authUserId, companyId);
    return this.fetchJson<Record<string, unknown>>(`/company/${encodeURIComponent(companyId)}`);
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
    });
  }

  async updateCompanyMedia(
    authUserId: string,
    companyId: string,
    dto: UpdateCompanyMediaDto,
    file: Express.Multer.File | undefined,
  ) {
    await this.ensureCompanyAccess(authUserId, companyId);
    const uploaded = await this.utilityService.uploadImage(file, `company/${companyId}`);
    return this.patchJson<Record<string, unknown>>(`/company/${encodeURIComponent(companyId)}`, {
      [dto.field]: uploaded.publicUrl,
    });
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

  async getCompanyJobs(authUserId: string, companyId: string) {
    await this.ensureCompanyAccess(authUserId, companyId);
    const jobs = await this.fetchJson<UpstreamJobSummary[]>('/job');
    return jobs.filter((job) => job.company_id === companyId);
  }
}
