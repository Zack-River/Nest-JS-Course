import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get('/api/v1/hello')
    getHello(): string {
        return 'Hello World!';
    }

    @Get('/api/v1/bye')
    getGoodbye(): string {
        return 'Goodbye World!';
    }

}