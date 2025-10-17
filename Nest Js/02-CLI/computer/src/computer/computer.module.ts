import { Module } from '@nestjs/common';
import { ComputerService } from './computer.service';
import { ComputerController } from './computer.controller';
import { CpuModule } from '../cpu/cpu.module';
import { DiskModule } from '../disk/disk.module';
import { PowerModule } from '../power/power.module';

@Module({
  providers: [ComputerService],
  imports: [CpuModule, DiskModule, PowerModule],
  controllers: [ComputerController]
})
export class ComputerModule {}
