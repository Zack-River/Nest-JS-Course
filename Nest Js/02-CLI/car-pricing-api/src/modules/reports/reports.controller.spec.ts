import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from './report.entity';
import { CreateReportDto } from './dto/request/create-report.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

describe('ReportsController', () => {
  let reports: Report[];
  let controller: ReportsController;
  let fakeReportsService: Partial<ReportsService>;
  beforeEach(async () => {
    reports = [];

    fakeReportsService = {
      create: (reportDto: CreateReportDto): Promise<Report> => {
        reports.push({ id: reports.length + 1, ...reportDto } as Report);
        return Promise.resolve(reports[reports.length - 1]);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: fakeReportsService,
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // it('should create a report', async () => {
  //   // Arrange
  //   const createReportDto: CreateReportDto = {
  //     price: 1000,
  //     make: 'Honda',
  //     model: 'Civic',
  //     year: 2020,
  //     lng: -122.4194,
  //     lat: 37.7749,
  //     mileage: 10000,
  //   };

  //   // Act
  //   const report = await controller.createReport(createReportDto);

  //   // Assert
  //   expect(report).toBeDefined();
  //   expect(report.data).toBeDefined();
  //   expect(report.data.id).toBe(1);
  // });

  it('should throw an error if data is not meeting the requirements', async () => {
    // Arrange
    const createReportDto = {
      price: 1000,
      make: 'Honda',
      model: 'Civic',
      year: 2020,
      lng: -122.4194,
      lat: 37.7749,
      mileage: 1000000,
    };

    createReportDto.mileage = 2000000;

    // Act
    const dtoInstance = plainToInstance(CreateReportDto, createReportDto);
    const errors = await validate(dtoInstance);

    // Assert
    expect(errors.length).toBeGreaterThan(0);
  });
});
