import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  SessionUserMatchGuard,
  UseAuthUserIdSources,
} from '../auth/guards/session-user-match.guard';
import { UpdateCompanyAboutDto } from './dto/update-company-about.dto';
import { UpdateCompanyAdditionInformationDto } from './dto/update-company-addition-information.dto';
import { UpdateCompanyInfoDto } from './dto/update-company-info.dto';
import { UpdateCompanyMediaDto } from './dto/update-company-media.dto';
import { CompanyService } from './company.service';

type RequestWithAuthUser = {
  auth_user_id?: string;
};

@ApiTags('company')
@UseGuards(SessionUserMatchGuard)
@UseAuthUserIdSources()
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get company data by id' })
  @ApiParam({ name: 'id', description: 'Company id' })
  @ApiResponse({ status: 200, description: 'Company data' })
  getCompany(@Req() req: RequestWithAuthUser, @Param('id') companyId: string) {
    return this.companyService.getCompany(req.auth_user_id ?? '', companyId);
  }

  @Patch(':id/info')
  @ApiOperation({ summary: 'Update company info (name, address, contact)' })
  @ApiParam({ name: 'id', description: 'Company id' })
  @ApiBody({ type: UpdateCompanyInfoDto })
  @ApiResponse({ status: 200, description: 'Updated company info' })
  updateCompanyInfo(
    @Req() req: RequestWithAuthUser,
    @Param('id') companyId: string,
    @Body() dto: UpdateCompanyInfoDto,
  ) {
    return this.companyService.updateCompanyInfo(req.auth_user_id ?? '', companyId, dto);
  }

  @Patch(':id/media')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload and replace company logo or banner' })
  @ApiParam({ name: 'id', description: 'Company id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        field: { type: 'string', enum: ['logo', 'banner'] },
        file: { type: 'string', format: 'binary' },
      },
      required: ['field', 'file'],
    },
  })
  @ApiResponse({ status: 200, description: 'Updated company media' })
  updateCompanyMedia(
    @Req() req: RequestWithAuthUser,
    @Param('id') companyId: string,
    @Body() dto: UpdateCompanyMediaDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.companyService.updateCompanyMedia(req.auth_user_id ?? '', companyId, dto, file);
  }

  @Patch(':id/about')
  @ApiOperation({ summary: 'Update company about section' })
  @ApiParam({ name: 'id', description: 'Company id' })
  @ApiBody({ type: UpdateCompanyAboutDto })
  @ApiResponse({ status: 200, description: 'Updated company about section' })
  updateCompanyAbout(
    @Req() req: RequestWithAuthUser,
    @Param('id') companyId: string,
    @Body() dto: UpdateCompanyAboutDto,
  ) {
    return this.companyService.updateCompanyAbout(req.auth_user_id ?? '', companyId, dto);
  }

  @Patch(':id/addition-information')
  @ApiOperation({ summary: 'Update company additional information section' })
  @ApiParam({ name: 'id', description: 'Company id' })
  @ApiBody({ type: UpdateCompanyAdditionInformationDto })
  @ApiResponse({ status: 200, description: 'Updated company additional information section' })
  updateCompanyAdditionInformation(
    @Req() req: RequestWithAuthUser,
    @Param('id') companyId: string,
    @Body() dto: UpdateCompanyAdditionInformationDto,
  ) {
    return this.companyService.updateCompanyAdditionInformation(
      req.auth_user_id ?? '',
      companyId,
      dto,
    );
  }

  @Get(':id/job')
  @ApiOperation({ summary: 'Get jobs in company' })
  @ApiParam({ name: 'id', description: 'Company id' })
  @ApiResponse({ status: 200, description: 'Company jobs' })
  getCompanyJobs(@Req() req: RequestWithAuthUser, @Param('id') companyId: string) {
    return this.companyService.getCompanyJobs(req.auth_user_id ?? '', companyId);
  }
}
