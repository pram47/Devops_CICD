import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  SessionUserMatchGuard,
  UseAuthUserIdSources,
} from '../auth/guards/session-user-match.guard';
import { UpdateCompanyAboutDto } from './dto/update-company-about.dto';
import { UpdateCompanyAdditionInformationDto } from './dto/update-company-addition-information.dto';
import { SearchCompanyJobDto } from './dto/search-company-job.dto';
import { UpdateCompanyInfoDto } from './dto/update-company-info.dto';
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

  @Get('user/:userId/company-id')
  @UseAuthUserIdSources('param.userId')
  @ApiOperation({ summary: 'Get company id list by user id from employee memberships' })
  @ApiParam({ name: 'userId', description: 'User id' })
  @ApiResponse({ status: 200, description: 'Primary company id and company id list' })
  getCompanyIdsByUserId(@Param('userId') userId: string) {
    return this.companyService.getCompanyIdsByUserId(userId);
  }

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
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'banner', maxCount: 1 },
    ]),
  )
  @ApiOperation({ summary: 'Upload and replace company logo and/or banner' })
  @ApiParam({ name: 'id', description: 'Company id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary' },
        banner: { type: 'string', format: 'binary' },
      },
      required: [],
    },
  })
  @ApiResponse({ status: 200, description: 'Updated company media' })
  updateCompanyMedia(
    @Req() req: RequestWithAuthUser,
    @Param('id') companyId: string,
    @UploadedFiles()
    files: {
      logo?: Express.Multer.File[];
      banner?: Express.Multer.File[];
    },
  ) {
    return this.companyService.updateCompanyMedia(req.auth_user_id ?? '', companyId, {
      logo: files.logo?.[0],
      banner: files.banner?.[0],
    });
  }

  @Patch(':id/verify-file')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'verify_file', maxCount: 1 }]))
  @ApiOperation({ summary: 'Upload or replace company verification file' })
  @ApiParam({ name: 'id', description: 'Company id' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        verify_file: { type: 'string', format: 'binary' },
      },
      required: ['verify_file'],
    },
  })
  @ApiResponse({ status: 200, description: 'Updated company verification file' })
  updateCompanyVerifyFile(
    @Req() req: RequestWithAuthUser,
    @Param('id') companyId: string,
    @UploadedFiles()
    files: {
      verify_file?: Express.Multer.File[];
    },
  ) {
    return this.companyService.updateCompanyVerifyFile(req.auth_user_id ?? '', companyId, {
      verify_file: files.verify_file?.[0],
    });
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
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Company jobs' })
  getCompanyJobs(
    @Req() req: RequestWithAuthUser,
    @Param('id') companyId: string,
    @Query() query: SearchCompanyJobDto,
  ) {
    return this.companyService.getCompanyJobs(req.auth_user_id ?? '', companyId, query);
  }
}
