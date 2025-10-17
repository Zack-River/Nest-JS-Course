import { Injectable } from '@nestjs/common';
import { PowerService } from '../power/power.service';
@Injectable()
export class CpuService {
    constructor(private powerService: PowerService) {}

    compute(...args: number[]): string {
        const powerInfo = this.powerService.supplyPower(args.length * 100);
        return `Computation performed. ${powerInfo}. Sum of args: ${args.reduce((acc, cur) => acc + cur, 0)}`;
    }
}
