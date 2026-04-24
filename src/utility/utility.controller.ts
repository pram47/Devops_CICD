import { Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
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
}
