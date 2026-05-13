import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import * as path from 'node:path';
import { Storage, type StorageOptions } from '@google-cloud/storage';

export type UtilityProvinceResponse = Record<string, unknown> | null;
export type UtilityDistrictResponse = Record<string, unknown> | null;
export type UtilitySubDistrictResponse = Record<string, unknown> | null;
export type UtilityPostalCodeItem = Record<string, unknown>;
export type UtilityPhoneRegionRefItem = {
  id: number;
  dialing_code: string;
  text_th: string | null;
  text_eng: string | null;
};
export type UtilityUploadFileResponse = {
  bucket: string;
  objectName: string;
  gsUri: string;
  publicUrl: string;
  signedUrl?: string;
  contentType: string;
  size: number;
};

type UploadBufferInput = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
};

@Injectable()
export class UtilityService {
  private gcsStorage?: Storage;

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

  private neo4jBaseUrl(): string {
    const url = this.config.get<string>('JOBBY_DB_NEO4J_URL');
    if (!url) {
      throw new Error('Missing env JOBBY_DB_NEO4J_URL for jobby-employer-bff');
    }
    return url.replace(/\/+$/, '');
  }

  private async fetchJsonFrom<T>(baseUrl: string, upstreamName: string, path: string): Promise<T> {
    const url = `${baseUrl}${path}`;
    const res = await fetch(url);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Upstream ${upstreamName} failed ${res.status} for ${path}: ${body}`);
    }
    return (await res.json()) as T;
  }

  async searchSkillsFromGraph(searchName: string): Promise<Record<string, unknown>[]> {
    const encodedSearch = encodeURIComponent(searchName ?? '');
    if (!encodedSearch) return [];
    return this.fetchJsonFrom<Record<string, unknown>[]>(
      this.neo4jBaseUrl(),
      '@jobby-db-neo4j',
      `/graph/element-id/lookup/skills/search/${encodedSearch}`,
    );
  }

  async getSkillDetailFromGraph(skillElementId: string): Promise<Record<string, unknown>> {
    const encodedId = encodeURIComponent(skillElementId ?? '');
    return this.fetchJsonFrom<Record<string, unknown>>(
      this.neo4jBaseUrl(),
      '@jobby-db-neo4j',
      `/graph/element-id/skills/${encodedId}`,
    );
  }

  async getProvince(id: number, authorization?: string): Promise<UtilityProvinceResponse> {
    return this.fetchJson<UtilityProvinceResponse>(`/address/provinces/${id}`, authorization);
  }

  async getDistrict(id: number, authorization?: string): Promise<UtilityDistrictResponse> {
    return this.fetchJson<UtilityDistrictResponse>(`/address/districts/${id}`, authorization);
  }

  async getSubDistrict(id: number, authorization?: string): Promise<UtilitySubDistrictResponse> {
    return this.fetchJson<UtilitySubDistrictResponse>(
      `/address/sub-districts/${id}`,
      authorization,
    );
  }

  async getProvincesOfThailand(authorization?: string): Promise<Record<string, unknown>[]> {
    const thailand = await this.fetchJson<Record<string, unknown> | null>(
      `/address/countries/76400`,
      authorization,
    );
    const provinces = (thailand as { provinces?: unknown } | null)?.provinces;
    return Array.isArray(provinces) ? (provinces as Record<string, unknown>[]) : [];
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

  async getPhoneRegionRef(): Promise<UtilityPhoneRegionRefItem[]> {
    return this.fetchJson<UtilityPhoneRegionRefItem[]>(`/reference/phone-region`);
  }

  async getOptionTypes(authorization?: string): Promise<{
    work_types: Record<string, unknown>[];
    work_options: Record<string, unknown>[];
    work_category: Record<string, unknown>[];
    apply_status: Record<string, unknown>[];
    job_status: Record<string, unknown>[];
    sort_by: { id: number; text_th: string; text_eng: string }[];
  }> {
    const [workTypes, workOptions, workCategory, applyStatus, jobStatus] = await Promise.all([
      this.fetchJson<Record<string, unknown>[]>('/reference/work-types', authorization).catch(
        () => [],
      ),
      this.fetchJson<Record<string, unknown>[]>('/reference/work-options', authorization).catch(
        () => [],
      ),
      this.fetchJson<Record<string, unknown>[]>('/reference/category', authorization).catch(() => []),
      this.fetchJson<Record<string, unknown>[]>('/reference/apply-status', authorization).catch(
        () => [],
      ),
      this.fetchJson<Record<string, unknown>[]>('/reference/job-status', authorization).catch(
        () => [],
      ),
    ]);
    return {
      work_types: workTypes ?? [],
      work_options: workOptions ?? [],
      work_category: workCategory ?? [],
      apply_status: applyStatus ?? [],
      job_status: jobStatus ?? [],
      sort_by: [
        { id: 1, text_th: 'ใหม่สุด', text_eng: 'newest' },
        { id: 2, text_th: 'เก่าสุด', text_eng: 'oldest' },
        { id: 3, text_th: 'ตรงทักษะมากสุด', text_eng: 'skill_match' },
        { id: 4, text_th: 'ผู้สมัครเยอะสุด', text_eng: 'most_applied' },
      ],
    };
  }

  private gcsBucketName(): string {
    const bucket = this.config.get<string>('GCS_BUCKET_NAME');
    if (!bucket) {
      throw new Error('Missing env GCS_BUCKET_NAME for jobby-bff');
    }
    return bucket;
  }

  private parseServiceAccountCredentials(raw: string): Record<string, unknown> {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      const decoded = Buffer.from(raw, 'base64').toString('utf8');
      return JSON.parse(decoded) as Record<string, unknown>;
    }
  }

  private gcsClient(): Storage {
    if (this.gcsStorage) {
      return this.gcsStorage;
    }

    const options: StorageOptions = {};
    const projectId = this.config.get<string>('GCS_PROJECT_ID');
    const keyFilename = this.config.get<string>('GCS_KEY_FILE');
    const credentialsRaw = this.config.get<string>('GCS_CREDENTIALS_JSON');

    if (projectId) {
      options.projectId = projectId;
    }
    if (keyFilename) {
      options.keyFilename = keyFilename;
    }
    if (credentialsRaw) {
      options.credentials = this.parseServiceAccountCredentials(credentialsRaw);
    }

    this.gcsStorage = new Storage(options);
    return this.gcsStorage;
  }

  /**
   * Parses path-style public URL: https://storage.googleapis.com/<bucket>/<objectKey>
   */
  private parsePathStyleStorageGoogleapisUrl(
    url: string,
  ): { bucket: string; objectKey: string } | undefined {
    try {
      const parsed = new URL(url.trim());
      if (parsed.hostname !== 'storage.googleapis.com') {
        return undefined;
      }
      const pathname = parsed.pathname.replace(/^\/+/, '');
      if (!pathname) {
        return undefined;
      }
      const slashAt = pathname.indexOf('/');
      if (slashAt <= 0) {
        return undefined;
      }
      const bucket = pathname.slice(0, slashAt);
      let objectKey = pathname.slice(slashAt + 1);
      if (!objectKey) {
        return undefined;
      }
      objectKey = decodeURIComponent(objectKey);
      return { bucket, objectKey };
    } catch {
      return undefined;
    }
  }

  /**
   * Mint a short-lived signed URL so browsers can read a private object.
   * Only supports the same bucket as {@link gcsBucketName} and path-style storage.googleapis.com URLs.
   */
  async getSignedReadUrlForPathStyleGcsUrl(
    storageHttpUrl: string,
    expiresMs = 60 * 60 * 1000,
  ): Promise<string | undefined> {
    const parsed = this.parsePathStyleStorageGoogleapisUrl(storageHttpUrl);
    if (!parsed || parsed.bucket !== this.gcsBucketName()) {
      return undefined;
    }

    const storage = this.gcsClient();
    try {
      const [signedUrl] = await storage
        .bucket(parsed.bucket)
        .file(parsed.objectKey)
        .getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + expiresMs,
        });
      return signedUrl;
    } catch {
      return undefined;
    }
  }

  private buildObjectName(originalName: string, folder?: string): string {
    const extension = path.extname(originalName ?? '');
    const baseName = path
      .basename(originalName ?? 'file', extension)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    const safeBaseName = baseName || 'file';
    const safeFolder = (folder ?? '')
      .trim()
      .replace(/\.\./g, '')
      .replace(/^\/+|\/+$/g, '');
    const fileName = `${Date.now()}-${randomUUID()}-${safeBaseName}${extension.toLowerCase()}`;
    return safeFolder ? `${safeFolder}/${fileName}` : fileName;
  }

  private async uploadToGcs(
    file: UploadBufferInput | undefined,
    folder?: string,
    imageOnly = false,
  ): Promise<UtilityUploadFileResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    if (imageOnly && !file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are allowed for this endpoint');
    }

    const bucketName = this.gcsBucketName();
    const objectName = this.buildObjectName(file.originalname, folder);
    const storage = this.gcsClient();
    const bucket = storage.bucket(bucketName);
    const storageFile = bucket.file(objectName);

    try {
      await storageFile.save(file.buffer, {
        resumable: false,
        contentType: file.mimetype,
        metadata: {
          cacheControl: imageOnly ? 'public, max-age=31536000' : 'private, max-age=0',
        },
      });

      let signedUrl: string | undefined;
      try {
        const [url] = await storageFile.getSignedUrl({
          version: 'v4',
          action: 'read',
          expires: Date.now() + 60 * 60 * 1000,
        });
        signedUrl = url;
      } catch {
        signedUrl = undefined;
      }

      return {
        bucket: bucketName,
        objectName,
        gsUri: `gs://${bucketName}/${objectName}`,
        publicUrl: `https://storage.googleapis.com/${bucketName}/${objectName}`,
        signedUrl,
        contentType: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException(
        `Failed to upload file to Google Cloud Storage: ${message}`,
      );
    }
  }

  async uploadFile(
    file: Express.Multer.File | undefined,
    folder?: string,
  ): Promise<UtilityUploadFileResponse> {
    return this.uploadToGcs(file, folder, false);
  }

  async uploadImage(
    file: Express.Multer.File | undefined,
    folder?: string,
  ): Promise<UtilityUploadFileResponse> {
    return this.uploadToGcs(file, folder, true);
  }

  async uploadImageFromDataUrl(
    dataUrl: string,
    folder?: string,
    originalName = 'image',
  ): Promise<UtilityUploadFileResponse> {
    const match = dataUrl.match(/^data:(?<mime>[-\w.+/]+);base64,(?<payload>.+)$/);
    if (!match?.groups?.mime || !match.groups.payload) {
      throw new BadRequestException('Invalid data URL format for image');
    }

    const mime = match.groups.mime;
    if (!mime.startsWith('image/')) {
      throw new BadRequestException('Only image data URLs are allowed');
    }

    const extension = mime.split('/')[1]?.toLowerCase() ?? 'bin';
    const normalizedExtension = extension === 'jpeg' ? 'jpg' : extension;
    const buffer = Buffer.from(match.groups.payload, 'base64');

    return this.uploadToGcs(
      {
        originalname: `${originalName}.${normalizedExtension}`,
        mimetype: mime,
        buffer,
        size: buffer.byteLength,
      },
      folder,
      true,
    );
  }

  async deleteObject(objectName: string, bucketName?: string): Promise<void> {
    const targetBucket = bucketName ?? this.gcsBucketName();
    const storage = this.gcsClient();
    const bucket = storage.bucket(targetBucket);
    const storageFile = bucket.file(objectName);
    try {
      await storageFile.delete({ ignoreNotFound: true });
    } catch {
      // Best effort cleanup: avoid failing business request due to stale object state.
    }
  }
}
