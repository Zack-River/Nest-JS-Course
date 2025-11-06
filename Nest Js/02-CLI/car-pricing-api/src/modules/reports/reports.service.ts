import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/request/create-report.dto';
import { User } from '../users/user.entity';
@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}
  async create(reportDto: CreateReportDto, user: User): Promise<Report> {
    const report = this.repo.create(reportDto);
    report.user = user;
    if (!report) {
      throw new InternalServerErrorException('Report cannot be created');
    }
    return await this.repo.save(report);
  }
}
