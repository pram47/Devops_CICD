import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateJobDto, JobSkillInputDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

type UpstreamCreatedJob = {
  id: string;
  created_at?: string | null;
  name?: string | null;
};

type Neo4jCreateJobResponse = {
  jobElementId: string;
};

type UpstreamCompany = {
  id: string;
};

type UpstreamPostalCode = {
  id: number;
  postal_code?: string | null;
  sub_district_id: number;
};

type NormalizedSkillPayload = {
  skillIds?: string[];
  skillNames?: string[];
  requiredSkillElementIds?: string[];
  syncNeo4jSkills: boolean;
};

type NormalizedAddressPayload = {
  postgresFields: Record<string, unknown>;
  subDistrictCode?: number;
  districtCode?: number;
  provinceCode?: number;
  countryCode?: number;
  postalCode?: number;
};

@Injectable()
export class JobService {
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

  private async postJson<T>(
    baseUrl: string,
    upstreamName: string,
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
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

  private async patchJson<T>(
    baseUrl: string,
    upstreamName: string,
    path: string,
    body: Record<string, unknown>,
  ): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`, {
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

  private async fetchJson<T>(baseUrl: string, upstreamName: string, path: string): Promise<T> {
    const res = await fetch(`${baseUrl}${path}`);
    if (!res.ok) {
      const resBody = await res.text().catch(() => '');
      throw new Error(`Upstream ${upstreamName} failed ${res.status} for ${path}: ${resBody}`);
    }
    return (await res.json()) as T;
  }

  private async ensureCompanyExists(companyId: string): Promise<void> {
    const trimmed = companyId.trim();
    if (!trimmed) {
      throw new BadRequestException('company_id must not be empty');
    }

    const res = await fetch(`${this.postgresBaseUrl()}/company/${encodeURIComponent(trimmed)}`);
    if (res.status === 404) {
      throw new BadRequestException(`company_id "${trimmed}" does not exist`);
    }
    if (!res.ok) {
      const resBody = await res.text().catch(() => '');
      throw new Error(
        `Upstream @jobby-db-postgres failed ${res.status} for /company/${trimmed}: ${resBody}`,
      );
    }

    const company = (await res.json().catch(() => null)) as UpstreamCompany | null;
    if (!company || !company.id) {
      throw new BadRequestException(`company_id "${trimmed}" does not exist`);
    }
  }

  private async fetchPostalCodes(subDistrictCode?: number): Promise<UpstreamPostalCode[]> {
    const query =
      subDistrictCode !== undefined
        ? `?sub_district_id=${encodeURIComponent(subDistrictCode)}`
        : '';
    const res = await fetch(`${this.postgresBaseUrl()}/address/postal-codes${query}`);
    if (!res.ok) {
      const resBody = await res.text().catch(() => '');
      throw new Error(
        `Upstream @jobby-db-postgres failed ${res.status} for /address/postal-codes${query}: ${resBody}`,
      );
    }
    return (await res.json()) as UpstreamPostalCode[];
  }

  private async resolvePostalCodeId(
    postalCode: number | undefined,
    subDistrictCode?: number,
  ): Promise<number | undefined> {
    if (postalCode === undefined) {
      return undefined;
    }

    const rows = await this.fetchPostalCodes(subDistrictCode);
    const byId = rows.find((item) => item.id === postalCode);
    if (byId) {
      return byId.id;
    }

    const postalCodeString = String(postalCode);
    const byCode = rows.find((item) => String(item.postal_code ?? '') === postalCodeString);
    if (byCode) {
      return byCode.id;
    }

    if (subDistrictCode !== undefined) {
      const allRows = await this.fetchPostalCodes();
      const globalById = allRows.find((item) => item.id === postalCode);
      if (globalById) {
        return globalById.id;
      }
      const globalByCode = allRows.find(
        (item) => String(item.postal_code ?? '') === postalCodeString,
      );
      if (globalByCode) {
        return globalByCode.id;
      }
    }

    throw new BadRequestException(
      `postal_code "${postalCode}" is invalid. Use postal_code.id or a code existing in postal_code table.`,
    );
  }

  private asObject(value: unknown): Record<string, unknown> | undefined {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }
    return value as Record<string, unknown>;
  }

  private mapLocationRefsToCodes(payload: Record<string, unknown>): Record<string, unknown> {
    const mapped: Record<string, unknown> = { ...payload };

    const country = this.asObject(mapped.country);
    if (country?.country_code !== undefined) {
      mapped.country_code = country.country_code;
    }

    const province = this.asObject(mapped.province);
    if (province?.province_code !== undefined) {
      mapped.province_code = province.province_code;
    }

    const district = this.asObject(mapped.district);
    if (district?.district_code !== undefined) {
      mapped.district_code = district.district_code;
    }

    const subDistrict = this.asObject(mapped.sub_district);
    if (subDistrict?.sub_district_code !== undefined) {
      mapped.sub_district_code = subDistrict.sub_district_code;
    }

    const postalCodeRef = this.asObject(mapped.postal_code_ref);
    if (postalCodeRef?.postal_code !== undefined) {
      const parsedPostalCode = Number(postalCodeRef.postal_code);
      mapped.postal_code = Number.isFinite(parsedPostalCode)
        ? parsedPostalCode
        : postalCodeRef.postal_code;
    } else if (postalCodeRef?.id !== undefined) {
      mapped.postal_code = postalCodeRef.id;
    }

    delete mapped.country;
    delete mapped.province;
    delete mapped.district;
    delete mapped.sub_district;
    delete mapped.postal_code_ref;

    return mapped;
  }

  private buildPostgresCreatePayload(
    dto: CreateJobDto,
    resolvedPostalCodeId?: number,
  ): Record<string, unknown> {
    const normalized = this.normalizeSkillPayload(dto);
    const normalizedAddress = this.normalizeAddressPayload(dto);
    return {
      ...(dto.id !== undefined && { id: dto.id }),
      ...(dto.eid !== undefined && { eid: dto.eid }),
      status: dto.status ?? 1,
      ...(dto.created_at !== undefined && { created_at: dto.created_at }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.description_rtf !== undefined && { description_rtf: dto.description_rtf }),
      ...(dto.start_apply !== undefined && { start_apply: dto.start_apply }),
      ...(dto.end_apply !== undefined && { end_apply: dto.end_apply }),
      ...(dto.cover_letter !== undefined && { cover_letter: dto.cover_letter }),
      ...(dto.work_experience !== undefined && { work_experience: dto.work_experience }),
      ...(dto.education !== undefined && { education: dto.education }),
      ...(dto.company_id !== undefined && { company_id: dto.company_id }),
      ...normalizedAddress.postgresFields,
      ...(resolvedPostalCodeId !== undefined && { postal_code: resolvedPostalCodeId }),
      ...(dto.category_ids !== undefined && { category_ids: dto.category_ids }),
      ...(dto.work_option_ids !== undefined && { work_option_ids: dto.work_option_ids }),
      ...(dto.work_type_ids !== undefined && { work_type_ids: dto.work_type_ids }),
      ...(normalized.skillIds !== undefined && { skill_ids: normalized.skillIds }),
      ...(normalized.skillNames !== undefined && { skill_names: normalized.skillNames }),
      ...(dto.addition_questions !== undefined && { addition_questions: dto.addition_questions }),
      ...(dto.addition_file !== undefined && { addition_file: dto.addition_file }),
    };
  }

  private buildPostgresUpdatePayload(
    dto: UpdateJobDto,
    resolvedPostalCodeId?: number,
  ): Record<string, unknown> {
    const normalized = this.normalizeSkillPayload(dto);
    const normalizedAddress = this.normalizeAddressPayload(dto);
    return {
      ...(dto.eid !== undefined && { eid: dto.eid }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.created_at !== undefined && { created_at: dto.created_at }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.description_rtf !== undefined && { description_rtf: dto.description_rtf }),
      ...(dto.start_apply !== undefined && { start_apply: dto.start_apply }),
      ...(dto.end_apply !== undefined && { end_apply: dto.end_apply }),
      ...(dto.cover_letter !== undefined && { cover_letter: dto.cover_letter }),
      ...(dto.work_experience !== undefined && { work_experience: dto.work_experience }),
      ...(dto.education !== undefined && { education: dto.education }),
      ...(dto.company_id !== undefined && { company_id: dto.company_id }),
      ...normalizedAddress.postgresFields,
      ...(resolvedPostalCodeId !== undefined && { postal_code: resolvedPostalCodeId }),
      ...(dto.category_ids !== undefined && { category_ids: dto.category_ids }),
      ...(dto.work_option_ids !== undefined && { work_option_ids: dto.work_option_ids }),
      ...(dto.work_type_ids !== undefined && { work_type_ids: dto.work_type_ids }),
      ...(normalized.skillIds !== undefined && { skill_ids: normalized.skillIds }),
      ...(normalized.skillNames !== undefined && { skill_names: normalized.skillNames }),
      ...(dto.addition_questions !== undefined && { addition_questions: dto.addition_questions }),
      ...(dto.addition_file !== undefined && { addition_file: dto.addition_file }),
    };
  }

  private normalizeSkills(skills?: JobSkillInputDto[]): JobSkillInputDto[] {
    if (!Array.isArray(skills) || skills.length === 0) {
      return [];
    }
    const cleaned = skills
      .filter((item): item is JobSkillInputDto => !!item && typeof item.skill_id === 'string')
      .map((item, idx) => ({
        index: Number.isFinite(item.index) ? Number(item.index) : idx,
        skill_id: item.skill_id.trim(),
        skill_name: item.skill_name?.trim(),
      }))
      .filter((item) => item.skill_id.length > 0);

    cleaned.sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    return cleaned;
  }

  private normalizeSkillPayload(dto: CreateJobDto | UpdateJobDto): NormalizedSkillPayload {
    const hasLegacySkillPayload =
      dto.skill_ids !== undefined ||
      dto.skill_names !== undefined ||
      dto.required_skill_element_ids !== undefined ||
      dto.skill_element_ids !== undefined;

    const normalizedSkills = this.normalizeSkills(dto.skills);
    if (dto.skills !== undefined) {
      const skillIds = normalizedSkills.map((item) => item.skill_id);
      const hasAnyName = normalizedSkills.some((item) => !!item.skill_name);
      return {
        skillIds,
        ...(hasAnyName && {
          skillNames: normalizedSkills.map((item) => item.skill_name ?? ''),
        }),
        requiredSkillElementIds: skillIds,
        syncNeo4jSkills: true,
      };
    }

    const skillIds = dto.skill_ids;
    const skillNames = dto.skill_names;
    const requiredSkillElementIds = hasLegacySkillPayload
      ? (dto.required_skill_element_ids ?? dto.skill_element_ids ?? dto.skill_ids ?? [])
      : undefined;

    return {
      ...(skillIds !== undefined && { skillIds }),
      ...(skillNames !== undefined && { skillNames }),
      ...(requiredSkillElementIds !== undefined && { requiredSkillElementIds }),
      syncNeo4jSkills: hasLegacySkillPayload,
    };
  }

  private normalizeAddressPayload(dto: CreateJobDto | UpdateJobDto): NormalizedAddressPayload {
    const address = dto.address;
    const addressLine = address?.address_line ?? dto.address_line;
    const no = address?.no ?? dto.no;
    const moo = address?.moo ?? dto.moo;
    const soi = address?.soi ?? dto.soi;
    const street = address?.street ?? dto.street;
    const subDistrictCode = address?.sub_district_code ?? dto.sub_district_code;
    const districtCode = address?.district_code ?? dto.district_code;
    const provinceCode = address?.province_code ?? dto.province_code;
    const countryCode = address?.country_code ?? dto.country_code;
    const postalCode = address?.postal_code ?? dto.postal_code;

    return {
      postgresFields: {
        ...(addressLine !== undefined && { address_line: addressLine }),
        ...(no !== undefined && { no }),
        ...(moo !== undefined && { moo }),
        ...(soi !== undefined && { soi }),
        ...(street !== undefined && { street }),
        ...(subDistrictCode !== undefined && { sub_district_code: subDistrictCode }),
        ...(districtCode !== undefined && { district_code: districtCode }),
        ...(provinceCode !== undefined && { province_code: provinceCode }),
        ...(countryCode !== undefined && { country_code: countryCode }),
        ...(postalCode !== undefined && { postal_code: postalCode }),
      },
      ...(subDistrictCode !== undefined && { subDistrictCode }),
      ...(districtCode !== undefined && { districtCode }),
      ...(provinceCode !== undefined && { provinceCode }),
      ...(countryCode !== undefined && { countryCode }),
      ...(postalCode !== undefined && { postalCode }),
    };
  }

  async create(createJobDto: CreateJobDto): Promise<Record<string, unknown>>;
  async create(companyId: string, createJobDto: CreateJobDto): Promise<Record<string, unknown>>;
  async create(companyIdOrDto: string | CreateJobDto, createJobDto?: CreateJobDto) {
    const postgresBaseUrl = this.postgresBaseUrl();
    const neo4jBaseUrl = this.neo4jBaseUrl();

    try {
      if (
        typeof companyIdOrDto === 'string' &&
        createJobDto?.company_id !== undefined &&
        createJobDto.company_id.trim() !== companyIdOrDto.trim()
      ) {
        throw new BadRequestException('company_id in body does not match company_id path param');
      }

      const payload: CreateJobDto =
        typeof companyIdOrDto === 'string'
          ? {
              ...(createJobDto ?? {}),
              company_id: companyIdOrDto,
            }
          : companyIdOrDto;

      const normalizedCompanyId = payload.company_id?.trim();
      if (!normalizedCompanyId) {
        throw new BadRequestException('company_id is required');
      }

      await this.ensureCompanyExists(normalizedCompanyId);

      payload.company_id = normalizedCompanyId;

      const normalizedAddress = this.normalizeAddressPayload(payload);
      const resolvedPostalCodeId = await this.resolvePostalCodeId(
        normalizedAddress.postalCode,
        normalizedAddress.subDistrictCode,
      );
      const created = await this.postJson<UpstreamCreatedJob>(
        postgresBaseUrl,
        '@jobby-db-postgres',
        '/job',
        this.buildPostgresCreatePayload(payload, resolvedPostalCodeId),
      );

      const normalizedSkillPayload = this.normalizeSkillPayload(payload);

      const neoJob = await this.postJson<Neo4jCreateJobResponse>(
        neo4jBaseUrl,
        '@jobby-db-neo4j',
        '/graph/element-id/jobs/create',
        {
          id: created.id,
          name: payload.name ?? created.name ?? undefined,
          company_id: payload.company_id,
          created_at: payload.created_at ?? created.created_at ?? undefined,
          work_type_id: payload.work_type_ids?.[0],
          country_code: normalizedAddress.countryCode,
          category_id: payload.category_ids?.[0],
          district_code: normalizedAddress.districtCode,
          province_code: normalizedAddress.provinceCode,
          work_option_id: payload.work_option_ids?.[0],
          ...(normalizedSkillPayload.syncNeo4jSkills && {
            required_skill_element_ids: normalizedSkillPayload.requiredSkillElementIds ?? [],
          }),
        },
      );

      const updated = await this.patchJson<Record<string, unknown>>(
        postgresBaseUrl,
        '@jobby-db-postgres',
        `/job/${encodeURIComponent(created.id)}`,
        { eid: neoJob.jobElementId },
      );

      return this.mapLocationRefsToCodes({
        ...updated,
        eid: neoJob.jobElementId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Create job failed: ${message}`);
    }
  }

  async getDetail(id: string) {
    try {
      const payload = await this.fetchJson<Record<string, unknown>>(
        this.postgresBaseUrl(),
        '@jobby-db-postgres',
        `/job/${encodeURIComponent(id)}`,
      );
      return this.mapLocationRefsToCodes(payload);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Get job detail failed: ${message}`);
    }
  }

  async update(id: string, updateJobDto: UpdateJobDto) {
    const postgresBaseUrl = this.postgresBaseUrl();
    const neo4jBaseUrl = this.neo4jBaseUrl();

    try {
      if (updateJobDto.company_id !== undefined) {
        await this.ensureCompanyExists(updateJobDto.company_id);
      }

      const normalizedAddress = this.normalizeAddressPayload(updateJobDto);
      const resolvedPostalCodeId = await this.resolvePostalCodeId(
        normalizedAddress.postalCode,
        normalizedAddress.subDistrictCode,
      );
      const updated = await this.patchJson<UpstreamCreatedJob & Record<string, unknown>>(
        postgresBaseUrl,
        '@jobby-db-postgres',
        `/job/${encodeURIComponent(id)}`,
        this.buildPostgresUpdatePayload(updateJobDto, resolvedPostalCodeId),
      );

      const normalizedSkillPayload = this.normalizeSkillPayload(updateJobDto);

      const neoJob = await this.postJson<Neo4jCreateJobResponse>(
        neo4jBaseUrl,
        '@jobby-db-neo4j',
        '/graph/element-id/jobs/create',
        {
          id: updated.id,
          name: updateJobDto.name ?? updated.name ?? undefined,
          company_id: updateJobDto.company_id,
          created_at: updateJobDto.created_at ?? updated.created_at ?? undefined,
          work_type_id: updateJobDto.work_type_ids?.[0],
          country_code: normalizedAddress.countryCode,
          category_id: updateJobDto.category_ids?.[0],
          district_code: normalizedAddress.districtCode,
          province_code: normalizedAddress.provinceCode,
          work_option_id: updateJobDto.work_option_ids?.[0],
          ...(normalizedSkillPayload.syncNeo4jSkills && {
            required_skill_element_ids: normalizedSkillPayload.requiredSkillElementIds ?? [],
          }),
        },
      );

      const updatedWithEid = await this.patchJson<Record<string, unknown>>(
        postgresBaseUrl,
        '@jobby-db-postgres',
        `/job/${encodeURIComponent(id)}`,
        { eid: neoJob.jobElementId },
      );

      return this.mapLocationRefsToCodes({
        ...updatedWithEid,
        eid: neoJob.jobElementId,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(`Update job failed: ${message}`);
    }
  }
}
