import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/request/create-report.dto';
import { User } from '../users/user.entity';
import { GetEstimateDto } from './dto/request/get-estimate.dto';
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

  async changeApproval(id: number, approved: boolean): Promise<Report> {
    const report = await this.repo.findOne({ where: { id } });
    if (!report) {
      throw new InternalServerErrorException('Report not found');
    }
    report.approved = approved;
    return await this.repo.save(report);
  }

  async createEstimate(query: GetEstimateDto) {
    const { make, model, year, lng, lat, mileage } = query;

    return this.repo
      .createQueryBuilder('report')
      .select('AVG(price)', 'price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('approved IS TRUE')
      .orderBy('mileage - :mileage', 'DESC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
