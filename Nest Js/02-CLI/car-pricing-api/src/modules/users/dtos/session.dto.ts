import { IsNumber, IsNotEmpty } from 'class-validator';
export class SessionDto {
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
