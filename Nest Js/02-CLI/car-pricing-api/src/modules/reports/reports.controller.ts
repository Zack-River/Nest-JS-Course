import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
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
@Controller('/reports')
@Serialize(ReportDto)
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Post()
  @UseGuards(AuthGuard)
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
}
