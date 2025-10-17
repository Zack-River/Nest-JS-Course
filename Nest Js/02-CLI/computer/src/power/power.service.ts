import { Injectable } from '@nestjs/common';

@Injectable()
export class PowerService {
    usedPower: number = 0;
    supplyPower(watts: number): string {
        this.usedPower += watts;
        return `Power supplied: ${watts} watts`;
    }

    getUsedPower(): number {
        return this.usedPower;
    }
}
