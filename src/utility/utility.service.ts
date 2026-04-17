import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type UtilityProvinceResponse = Record<string, unknown> | null;
export type UtilityDistrictResponse = Record<string, unknown> | null;
export type UtilityPostalCodeItem = Record<string, unknown>;

@Injectable()
export class UtilityService {
  constructor(private readonly config: ConfigService) {}

  private postgresBaseUrl(): string {
    const url = this.config.get<string>('JOBBY_DB_POSTGRES_URL');
    if (!url) {
      throw new Error('Missing env JOBBY_DB_POSTGRES_URL for jobby-bff');
    }
    return url.replace(/\/+$/, '');
  }

  private async fetchJson<T>(path: string, authorization?: string): Promise<T> {
    const baseUrl = this.postgresBaseUrl();
    const url = `${baseUrl}${path}`;
    const res = await fetch(url, {
      headers: {
        ...(authorization ? { authorization } : {}),
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Upstream @jobby-db-postgres failed ${res.status} for ${path}: ${body}`);
    }
    return (await res.json()) as T;
  }

  async getProvince(id: number, authorization?: string): Promise<UtilityProvinceResponse> {
    return this.fetchJson<UtilityProvinceResponse>(`/address/provinces/${id}`, authorization);
  }

  async getDistrict(id: number, authorization?: string): Promise<UtilityDistrictResponse> {
    return this.fetchJson<UtilityDistrictResponse>(`/address/districts/${id}`, authorization);
  }

  async getPostalCode(
    subDistrictId?: number,
    authorization?: string,
  ): Promise<UtilityPostalCodeItem[]> {
    const query =
      subDistrictId !== undefined && Number.isFinite(subDistrictId)
        ? `?sub_district_id=${subDistrictId}`
        : '';
    return this.fetchJson<UtilityPostalCodeItem[]>(`/address/postal-codes${query}`, authorization);
  }
}
