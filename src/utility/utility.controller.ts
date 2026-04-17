import { Controller, Get, Headers, Param, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  UtilityDistrictResponse,
  UtilityPostalCodeItem,
  UtilityProvinceResponse,
  UtilityService,
} from './utility.service';

@ApiTags('utility')
@ApiBearerAuth()
@Controller('utility')
export class UtilityController {
  constructor(private readonly utilityService: UtilityService) {}

  @Get('province/:id')
  @ApiOperation({ summary: 'Get province by id' })
  @ApiParam({ name: 'id', description: 'Province id' })
  @ApiOkResponse({ schema: { type: 'object', nullable: true } })
  async getProvince(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
  ): Promise<UtilityProvinceResponse> {
    return this.utilityService.getProvince(Number(id), authorization);
  }

  @Get('district/:id')
  @ApiOperation({ summary: 'Get district by id' })
  @ApiParam({ name: 'id', description: 'District id' })
  @ApiOkResponse({ schema: { type: 'object', nullable: true } })
  async getDistrict(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
  ): Promise<UtilityDistrictResponse> {
    return this.utilityService.getDistrict(Number(id), authorization);
  }

  @Get('postal_code')
  @ApiOperation({ summary: 'Get postal_code list (optional: filter by sub_district_id)' })
  @ApiQuery({ name: 'sub_district_id', required: false })
  @ApiOkResponse({ schema: { type: 'array', items: { type: 'object' } } })
  async getPostalCode(
    @Query('sub_district_id') subDistrictId?: string,
    @Headers('authorization') authorization?: string,
  ): Promise<UtilityPostalCodeItem[]> {
    return this.utilityService.getPostalCode(
      subDistrictId !== undefined ? Number(subDistrictId) : undefined,
      authorization,
    );
  }
}
