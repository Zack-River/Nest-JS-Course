import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CreateReportDto } from './dto/request/create-report.dto';
import { ReportsService } from './reports.service';
import { ApiResponse } from '../../common/dtos';
import { Report } from './report.entity';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { Serialize } from 'src/common/decorators/serialize.decorator';
import { ReportDto } from './dto/report.dto';
import { ApproveReportDto } from './dto/request/approve-report.dto';
import { AdminGuard } from 'src/common/guards/admin.guard';
import { GetEstimateDto } from './dto/request/get-estimate.dto';

@Controller('/reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @Serialize(ReportDto)
  async createReport(
    @Body() body: CreateReportDto,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<Report>> {
    const report = await this.reportsService.create(body, user);

    if (!report) {
      throw new HttpException(
        'Report not created',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return ApiResponse.success(
      'createReport',
      'Report created successfully',
      report,
      {
        affectedRows: 1,
        session: { userId: user.id },
      },
    );
  }

  @Patch('/:id')
  @UseGuards(AdminGuard)
  @Serialize(ReportDto)
  async approveReport(
    @Param('id') id: number,
    @Body() body: ApproveReportDto,
  ): Promise<ApiResponse<Report>> {
    const report = await this.reportsService.changeApproval(id, body.approved);

    if (!report) {
      throw new HttpException(
        'Report not approved',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return ApiResponse.success(
      'approveReport',
      `Report ${body.approved ? 'approved' : 'rejected'} successfully`,
      report,
      {
        affectedRows: 1,
      },
    );
  }

  @Get('/')
  async getEstimate(@Query() query: GetEstimateDto) {
    return this.reportsService.createEstimate(query);
  }
}
