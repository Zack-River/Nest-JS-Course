import { Injectable } from '@nestjs/common';
import { CpuService } from '../cpu/cpu.service';
import { DiskService } from '../disk/disk.service';
import { PowerService } from '../power/power.service';

@Injectable()
export class ComputerService {
    constructor(private cpuService: CpuService, private diskService: DiskService, private powerService: PowerService) {}

    run(): string {
        const cpuResult = this.cpuService.compute(1,2);
        const diskResult = this.diskService.getData();
        const powerResult = this.powerService.getUsedPower();
        return `Computer is running:\n${cpuResult}\n${diskResult}\n${powerResult} watts used in total.`;
    }
}
