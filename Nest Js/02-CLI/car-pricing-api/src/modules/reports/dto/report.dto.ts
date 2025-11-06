import { Expose, Transform, Type } from 'class-transformer';
import { UserDto } from '../../users/dtos/user.dto';

export class ReportDto {
  @Expose() id: number;
  @Expose() price: number;
  @Expose() make: string;
  @Expose() model: string;
  @Expose() year: number;
  @Expose() lng: number;
  @Expose() lat: number;
  @Expose() mileage: number;

  @Transform(({ obj }) => obj.user.id)
  @Expose()
  userId: number;
}
