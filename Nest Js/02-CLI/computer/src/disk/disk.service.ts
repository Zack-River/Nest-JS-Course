import { Injectable } from '@nestjs/common';
import { PowerService } from '../power/power.service';
@Injectable()
export class DiskService {
    constructor(private powerService: PowerService) {}
    getData(): string {
        const powerInfo = this.powerService.supplyPower(100);
        return `Disk read performed. ${powerInfo}`;
    }
}
