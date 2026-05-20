import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors, Res, StreamableFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  UtilityDistrictResponse,
  UtilityUploadFileResponse,
  UtilityPostalCodeItem,
  UtilityPhoneRegionRefItem,
  UtilityProvinceResponse,
  UtilityService,
} from './utility.service';

@ApiTags('utility')
@ApiBearerAuth()
@Controller('utility')
export class UtilityController {
  constructor(private readonly utilityService: UtilityService) {}

  @Get('province')
  @ApiOperation({ summary: 'Get provinces in Thailand (country_id=76400)', security: [] })
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'object' } } })
  async getProvincesOfThailand(): Promise<Record<string, unknown>[]> {
    return this.utilityService.getProvincesOfThailand();
  }

  // Route rename: was GET utility/province/:id
  @Get('district/:id')
  @ApiOperation({ summary: 'Get province by id', security: [] })
  @ApiParam({ name: 'id', description: 'Province id' })
  @ApiOkResponse({ schema: { type: 'object', nullable: true } })
  async getProvinceById(@Param('id') id: string): Promise<UtilityProvinceResponse> {
    return this.utilityService.getProvince(Number(id));
  }

  // Route rename: was GET utility/district/:id
  @Get('sub-district/:id')
  @ApiOperation({ summary: 'Get district by id', security: [] })
  @ApiParam({ name: 'id', description: 'District id' })
  @ApiOkResponse({ schema: { type: 'object', nullable: true } })
  async getDistrictById(@Param('id') id: string): Promise<UtilityDistrictResponse> {
    return this.utilityService.getDistrict(Number(id));
  }

  @Get('postal_code/:sub_district_id')
  @ApiOperation({
    summary: 'Get postal_code list by sub_district_id',
    security: [],
  })
  @ApiParam({ name: 'sub_district_id', description: 'Sub-district id' })
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'object' } } })
  async getPostalCode(
    @Param('sub_district_id') subDistrictId: string,
  ): Promise<UtilityPostalCodeItem[]> {
    return this.utilityService.getPostalCode(Number(subDistrictId));
  }

  @Get('phone-region')
  @ApiOperation({ summary: 'Get phone region reference list (PhoneRegionRef)', security: [] })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          dialing_code: { type: 'string' },
          text_th: { type: 'string', nullable: true },
          text_eng: { type: 'string', nullable: true },
        },
      },
    },
  })
  async getPhoneRegionRef(): Promise<UtilityPhoneRegionRefItem[]> {
    return this.utilityService.getPhoneRegionRef();
  }

  @Get('option-type')
  @ApiOperation({ summary: 'Get work types and work options reference', security: [] })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        work_types: { type: 'array', items: { type: 'object' } },
        work_options: { type: 'array', items: { type: 'object' } },
        work_category: { type: 'array', items: { type: 'object' } },
        apply_status: { type: 'array', items: { type: 'object' } },
        job_status: { type: 'array', items: { type: 'object' } },
        sort_by: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              text_th: { type: 'string' },
              text_eng: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getOptionType(): Promise<{
    work_types: Record<string, unknown>[];
    work_options: Record<string, unknown>[];
    work_category: Record<string, unknown>[];
    apply_status: Record<string, unknown>[];
    job_status: Record<string, unknown>[];
    sort_by: { id: number; text_th: string; text_eng: string }[];
  }> {
    return this.utilityService.getOptionTypes();
  }

  @Post('upload/file')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload any file to Google Cloud Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'documents' },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ schema: { type: 'object' } })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ): Promise<UtilityUploadFileResponse> {
    return this.utilityService.uploadFile(file, folder);
  }

  @Post('upload/image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload image file to Google Cloud Storage' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        folder: { type: 'string', example: 'images' },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ schema: { type: 'object' } })
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
  ): Promise<UtilityUploadFileResponse> {
    return this.utilityService.uploadImage(file, folder);
  }

  @Get('skills/search/:searchName')
  @ApiOperation({ summary: 'Search skills by name from graph database', security: [] })
  @ApiParam({ name: 'searchName', description: 'Partial skill name query' })
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'object' } } })
  async searchSkills(@Param('searchName') searchName: string): Promise<Record<string, unknown>[]> {
    return this.utilityService.searchSkillsFromGraph(searchName);
  }

  @Get('skills/:skillElementId')
  @ApiOperation({
    summary: 'Get full skill payload by graph element id',
    description: 'Neo4j skill fields and related skills (graph).',
    security: [],
  })
  @ApiParam({ name: 'skillElementId', description: 'Neo4j skill elementId' })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        related_skills: { type: 'array', items: { type: 'object' } },
      },
    },
  })
  async getSkillDetail(
    @Param('skillElementId') skillElementId: string,
  ): Promise<Record<string, unknown>> {
    return this.utilityService.getSkillDetailFromGraph(skillElementId);
  }

  @Get('resume/:resumeId/export')
  @ApiOperation({ summary: 'Export resume (serve uploaded file if available, else generate PDF)', security: [] })
  @ApiParam({ name: 'resumeId', description: 'Resume id to export' })
  @ApiOkResponse({
    description: 'Resume binary stream (original file or generated PDF)',
    schema: { type: 'string', format: 'binary' },
  })
  async exportResume(
    @Param('resumeId') resumeId: string,
    @Res({ passthrough: true }) res?: any,
  ): Promise<StreamableFile> {
    const resumeServiceUrl = (process.env.JOBBY_RESUME_SERVICE_URL ?? '').replace(/\/+$/, '');

    // fetch resume detail from resume service
    const detailRes = await fetch(`${resumeServiceUrl}/resume/${encodeURIComponent(resumeId)}`);
    if (detailRes.ok) {
      const detail = (await detailRes.json().catch(() => null)) as Record<string, unknown> | null;
      const resumeFileUrl = typeof detail?.resume_file === 'string' ? detail.resume_file : undefined;
      const resumeMeta = (detail?.resume_file_metadata as Record<string, unknown> | undefined) ?? undefined;
      if (resumeFileUrl) {
        const signed = await this.utilityService.getSignedReadUrlForPathStyleGcsUrl(resumeFileUrl);
        const fetchUrl = signed ?? resumeFileUrl;
        try {
          const upstream = await fetch(fetchUrl);
          if (upstream.ok) {
            const arrayBuffer = await upstream.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const contentType =
              upstream.headers.get('content-type') ?? (resumeMeta?.contentType as string) ?? 'application/octet-stream';
            const filename =
              (resumeMeta?.file_name as string) ??
              (resumeMeta?.fileName as string) ??
              `resume-${resumeId}.bin`;
            const disposition = `attachment; filename="${filename}"`;
            res?.setHeader('Content-Type', contentType);
            res?.setHeader('Content-Disposition', disposition);
            return new StreamableFile(buffer);
          }
        } catch {
          // fall through to PDF export
        }
      }
    }

    // fallback: request resume-service to generate PDF
    const pdfRes = await fetch(`${resumeServiceUrl}/resume/export`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ resume_id: resumeId }),
    });
    if (!pdfRes.ok) {
      const body = await pdfRes.text().catch(() => '');
      throw new Error(`Upstream resume service failed ${pdfRes.status}: ${body}`);
    }
    const arrayBuffer = await pdfRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = pdfRes.headers.get('content-type') ?? 'application/pdf';
    const disposition = pdfRes.headers.get('content-disposition') ?? 'attachment; filename="resume.pdf"';
    res?.setHeader('Content-Type', contentType);
    res?.setHeader('Content-Disposition', disposition);
    return new StreamableFile(buffer);
  }
}
